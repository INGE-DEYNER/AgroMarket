import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Cargar variables de entorno
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configurar CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.SOCKET_PORT || 3001;

/**
 * URL del backend Spring: fuente de verdad de los mensajes y de las reglas
 * de comunicación. El servidor Socket.io persiste aquí cada mensaje para que
 * el historial sea el mismo que ve el resto de la aplicación.
 */
const SPRING_BACKEND_URL = (
  process.env.SPRING_BACKEND_URL || 'http://localhost:8080'
).replace(/\/+$/, '');

// Middleware para CORS en Express
app.use(cors({
  origin: allowedOrigins
}));

app.use(express.json());

// Almacenamiento temporal de conexiones activas
// Estructura: { userId: { socketId: socket, role: string, username: string } }
const activeConnections = new Map();

// Almacenamiento temporal de mensajes (para persistencia básica)
// En producción, esto debería estar en una base de datos
const messagesStore = new Map();

// Almacenamiento de tickets
const ticketsStore = new Map();

// Función para extraer información del token JWT.
//
// Si JWT_SECRET está configurado (debe coincidir con app.jwt.secret del
// backend Spring) se VERIFICA la firma con jsonwebtoken. Solo si no hay
// secreto configurado se cae al decodificado simple, que es inseguro y por
// eso queda registrado como advertencia.
function extractUserFromToken(token) {
  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET;
    let payloadObj;

    if (secret) {
      payloadObj = jwt.verify(token, secret);
    } else {
      console.warn(
        '[auth] JWT_SECRET no configurado: se decodifica el token SIN verificar la firma.'
      );
      const base64Payload = token.split('.')[1];
      payloadObj = JSON.parse(
        Buffer.from(base64Payload, 'base64').toString('utf-8')
      );
    }

    const userId = payloadObj.sub || payloadObj.userId || payloadObj.id;

    if (!userId) return null;

    return {
      userId: String(userId),
      username: payloadObj.username || payloadObj.email || String(userId),
      role: payloadObj.role || payloadObj.rol,
      email: payloadObj.email,
    };
  } catch (error) {
    console.error('Error decodificando token:', error.message);
    return null;
  }
}

// ==================== REGLAS DE COMUNICACIÓN (ASAFRUT) ====================
//
// Deben coincidir con MessagingService.java del backend Spring:
//  - Comprador ↔ Productor: comunicación directa.
//  - Administración → Comprador/Productor: permitida (la administración inicia).
//  - Comprador/Productor → Administración: solo si la administración ya inició
//    la conversación; si no, el canal es el ticket de soporte.

const BUYER_ROLES = ['COMPRADOR', 'BUYER', 'COMPRADOR_EMPRESA', 'BUYER_COMPANY'];
const PRODUCER_ROLES = ['PRODUCTOR', 'PRODUCER'];
const ADMIN_ROLES = ['ADMIN', 'ADMINISTRADOR'];
const STAFF_ROLES = [...BUYER_ROLES, ...PRODUCER_ROLES];

function normalizeRole(role) {
  return (role || '').toString().toUpperCase();
}

function esRol(role, familia) {
  return familia.includes(normalizeRole(role));
}

function esAdmin(role) {
  return esRol(role, ADMIN_ROLES);
}

function esCompradorOProductor(role) {
  return esRol(role, STAFF_ROLES);
}

/**
 * ¿El remitente puede escribir al destinatario?
 *
 * @param {boolean} adminInitiated true cuando ya existe una conversación en la
 *   que la administración escribió primero (permite la respuesta del usuario).
 */
function canCommunicate(senderRole, receiverRole, adminInitiated = false) {
  const sender = normalizeRole(senderRole);
  const receiver = normalizeRole(receiverRole);

  if (!sender || !receiver || sender === receiver) {
    return false;
  }

  // Comprador ↔ Productor.
  const cruzado =
    (esRol(sender, BUYER_ROLES) && esRol(receiver, PRODUCER_ROLES)) ||
    (esRol(sender, PRODUCER_ROLES) && esRol(receiver, BUYER_ROLES));

  if (cruzado) return true;

  // Administración → Comprador/Productor.
  if (esAdmin(sender) && esCompradorOProductor(receiver)) return true;

  // Comprador/Productor → Administración: solo respondiendo a la admin.
  if (esAdmin(receiver) && esCompradorOProductor(sender)) {
    return adminInitiated;
  }

  return false;
}

/**
 * Motivo legible del rechazo (el frontend lo muestra al usuario).
 */
function motivoRechazo(senderRole, receiverRole) {
  if (esAdmin(receiverRole) && esCompradorOProductor(senderRole)) {
    return 'Para comunicarte con la administración debes crear un ticket de soporte.';
  }
  if (normalizeRole(senderRole) === normalizeRole(receiverRole)) {
    return 'No puedes enviar mensajes a usuarios con tu mismo rol.';
  }
  return 'No puedes enviar mensajes a este usuario: la mensajería directa solo está permitida entre compradores y productores.';
}

/**
 * ¿La administración ya escribió a este usuario? Habilita la respuesta del
 * usuario dentro de la conversación que la administración inició.
 */
function adminInitiatedConversation(usuarioId, adminId) {
  if (!usuarioId || !adminId) return false;

  const claves = [`${adminId}_${usuarioId}`];

  return claves.some((clave) =>
    (messagesStore.get(clave) || []).some(
      (mensaje) =>
        String(mensaje.senderId) === String(adminId) &&
        esAdmin(mensaje.senderRole)
    )
  );
}

/** Busca la conexión activa de un usuario (o null). */
function findConnectionByUserId(userId) {
  for (const [, conn] of activeConnections) {
    if (String(conn.userId) === String(userId)) {
      return conn;
    }
  }
  return null;
}

/**
 * Persiste el mensaje en el backend Spring (fuente de verdad). Spring valida
 * las reglas de comunicación y responde 403 con el motivo cuando no se puede.
 *
 * @returns {Promise<{message?: object, error?: string}>}
 */
async function persistirMensajeEnBackend(token, recipientId, content) {
  try {
    const respuesta = await fetch(`${SPRING_BACKEND_URL}/api/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        destinatarioId: Number(recipientId),
        contenido: content,
      }),
    });

    const data = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
      return { error: data?.message || `HTTP ${respuesta.status}` };
    }

    return { message: data };
  } catch (error) {
    console.error('[backend] no se pudo persistir el mensaje:', error.message);
    return {
      error:
        'No se pudo guardar el mensaje. Verifica que el backend esté disponible.',
    };
  }
}

// Conectar Socket.io
io.on('connection', (socket) => {
  console.log(`Nueva conexión: ${socket.id}`);
  
  // Autenticación del socket
  socket.on('authenticate', (token) => {
    const user = extractUserFromToken(token);
    
    if (!user || !user.userId) {
      console.error('Autenticación fallida para socket:', socket.id);
      socket.emit('auth_error', { message: 'Token inválido o expirado' });
      socket.disconnect(true);
      return;
    }
    
    // Almacenar conexión activa
    activeConnections.set(socket.id, {
      socket,
      userId: user.userId,
      role: user.role,
      username: user.username,
      email: user.email
    });
    
    console.log(`Usuario autenticado: ${user.username} (${user.role}) - Socket: ${socket.id}`);
    
    // Notificar al cliente que la autenticación fue exitosa
    socket.emit('auth_success', {
      userId: user.userId,
      username: user.username,
      role: user.role
    });
    
    // Unirse a rooms específicos
    socket.join(`user_${user.userId}`);
    socket.join(`role_${user.role}`);
    
    // Notificar a los contactos que este usuario está en línea
    io.emit('user_online', {
      userId: user.userId,
      username: user.username,
      role: user.role
    });
  });
  
  // Manejar mensaje directo (chat entre roles permitidos)
  socket.on('send_message', async ({ recipientId, content, token }) => {
    const sender = extractUserFromToken(token);

    if (!sender || !sender.userId) {
      socket.emit('error', { message: 'Token inválido' });
      return;
    }

    if (!recipientId || !content || !String(content).trim()) {
      socket.emit('error', { message: 'El destinatario y el contenido son obligatorios' });
      return;
    }

    const recipientConnection = findConnectionByUserId(recipientId);
    const recipientRole = recipientConnection?.role;

    /*
     * Reglas de comunicación. Si el destinatario está conectado se valida de
     * inmediato con su rol; si no, la validación definitiva la hace Spring al
     * persistir (y devuelve el motivo del rechazo).
     */
    if (recipientRole) {
      const adminInitiated =
        esAdmin(recipientRole) &&
        adminInitiatedConversation(sender.userId, recipientId);

      if (!canCommunicate(sender.role, recipientRole, adminInitiated)) {
        socket.emit('error', {
          message: motivoRechazo(sender.role, recipientRole),
          reason: 'comunicacion_no_permitida',
        });
        return;
      }
    }

    // Persistir en el backend: única fuente de verdad del historial.
    const { message: guardado, error } = await persistirMensajeEnBackend(
      token,
      recipientId,
      String(content).trim()
    );

    if (error) {
      socket.emit('error', { message: error, reason: 'persistencia' });
      return;
    }

    const conversationKey = `${sender.userId}_${recipientId}`;
    const timestamp = guardado?.sentAt || new Date().toISOString();

    const message = {
      id: guardado?.id != null ? String(guardado.id) : Date.now().toString(),
      senderId: sender.userId,
      senderUsername: guardado?.senderName || sender.username,
      senderRole: sender.role,
      recipientId,
      recipientRole,
      content: guardado?.content || String(content).trim(),
      timestamp,
      read: false,
    };

    if (!messagesStore.has(conversationKey)) {
      messagesStore.set(conversationKey, []);
    }
    messagesStore.get(conversationKey).push(message);

    // Confirmación al remitente.
    socket.emit('message_sent', message);

    // Entrega en vivo solo si el destinatario está conectado.
    if (recipientConnection) {
      recipientConnection.socket.emit('receive_message', message);

      recipientConnection.socket.emit('notification', {
        type: 'new_message',
        title: `Nuevo mensaje de ${message.senderUsername}`,
        body:
          message.content.substring(0, 50) +
          (message.content.length > 50 ? '...' : ''),
        data: {
          senderId: sender.userId,
          senderUsername: message.senderUsername,
          conversationId: conversationKey,
        },
      });

      console.log(
        `Mensaje enviado de ${sender.username} a ${recipientConnection.username}`
      );
      return;
    }

    console.log(
      `Mensaje de ${sender.username} guardado para ${recipientId} (destinatario desconectado)`
    );
  });
  
  // Manejar creación de ticket
  socket.on('create_ticket', async ({ subject, description, token }) => {
    const user = extractUserFromToken(token);
    
    if (!user || !user.userId) {
      socket.emit('error', { message: 'Token inválido' });
      return;
    }
    
    // Solo Comprador y Vendedor pueden crear tickets
    if (!['COMPRADOR', 'BUYER', 'COMPRADOR_EMPRESA', 'BUYER_COMPANY', 'PRODUCTOR', 'PRODUCER'].includes(user.role?.toUpperCase())) {
      socket.emit('error', { message: 'No tienes permiso para crear tickets' });
      return;
    }
    
    const ticketId = Date.now().toString();
    const timestamp = new Date().toISOString();
    
    const ticket = {
      id: ticketId,
      creatorId: user.userId,
      creatorUsername: user.username,
      creatorRole: user.role,
      subject,
      description,
      status: 'OPEN',
      priority: 'MEDIUM',
      createdAt: timestamp,
      updatedAt: timestamp,
      messages: []
    };
    
    // Almacenar el ticket
    ticketsStore.set(ticketId, ticket);
    
    // Notificar a todos los admins
    io.to('role_ADMIN').emit('new_ticket', ticket);
    
    // Notificar al creador
    socket.emit('ticket_created', ticket);
    
    // Notificación al creador
    socket.emit('notification', {
      type: 'ticket_created',
      title: 'Ticket creado',
      body: `Tu ticket "${subject}" ha sido creado y notificado a los administradores`,
      data: { ticketId }
    });
    
    console.log(`Ticket creado por ${user.username}: ${subject}`);
  });
  
  // Manejar mensaje en ticket
  socket.on('send_ticket_message', async ({ ticketId, content, token }) => {
    const user = extractUserFromToken(token);
    
    if (!user || !user.userId) {
      socket.emit('error', { message: 'Token inválido' });
      return;
    }
    
    const ticket = ticketsStore.get(ticketId);
    
    if (!ticket) {
      socket.emit('error', { message: 'Ticket no encontrado' });
      return;
    }
    
    // Verificar permisos
    const isCreator = ticket.creatorId === user.userId;
    const isAdmin = user.role?.toUpperCase() === 'ADMIN';
    
    if (!isCreator && !isAdmin) {
      socket.emit('error', { message: 'No tienes permiso para responder a este ticket' });
      return;
    }
    
    // Crear el mensaje del ticket
    const message = {
      id: Date.now().toString(),
      senderId: user.userId,
      senderUsername: user.username,
      senderRole: user.role,
      content,
      timestamp: new Date().toISOString()
    };
    
    // Agregar al ticket
    ticket.messages.push(message);
    ticket.updatedAt = new Date().toISOString();
    
    // Notificar a todos los participantes del ticket
    // Creador del ticket
    for (const [, conn] of activeConnections) {
      if (conn.userId === ticket.creatorId) {
        conn.socket.emit('ticket_message', { ticketId, message });
      }
    }
    
    // Todos los admins
    io.to('role_ADMIN').emit('ticket_message', { ticketId, message });
    
    // Confirmación al remitente
    socket.emit('ticket_message_sent', { ticketId, message });
    
    // Notificación
    socket.emit('notification', {
      type: 'ticket_update',
      title: `Actualización en ticket #${ticketId}`,
      body: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      data: { ticketId }
    });
    
    console.log(`Mensaje en ticket ${ticketId} de ${user.username}`);
  });
  
  // Manejar Admin iniciando comunicación
  socket.on('admin_send_message', async ({ recipientId, content, token }) => {
    const admin = extractUserFromToken(token);

    if (!admin || !admin.userId || !esAdmin(admin.role)) {
      socket.emit('error', { message: 'Solo los administradores pueden usar este canal' });
      return;
    }

    if (!recipientId || !content || !String(content).trim()) {
      socket.emit('error', { message: 'El destinatario y el contenido son obligatorios' });
      return;
    }

    const recipientConnection = findConnectionByUserId(recipientId);
    const recipientRole = recipientConnection?.role;

    // Regla: la administración solo escribe a compradores o productores.
    if (recipientRole && !esCompradorOProductor(recipientRole)) {
      socket.emit('error', {
        message: 'Solo puedes enviar mensajes a compradores o productores',
      });
      return;
    }

    const { message: guardado, error } = await persistirMensajeEnBackend(
      token,
      recipientId,
      String(content).trim()
    );

    if (error) {
      socket.emit('error', { message: error, reason: 'persistencia' });
      return;
    }

    const conversationKey = `${admin.userId}_${recipientId}`;

    const message = {
      id: guardado?.id != null ? String(guardado.id) : Date.now().toString(),
      senderId: admin.userId,
      senderUsername: guardado?.senderName || admin.username,
      senderRole: admin.role,
      recipientId,
      recipientRole,
      content: guardado?.content || String(content).trim(),
      timestamp: guardado?.sentAt || new Date().toISOString(),
      read: false,
      isAdminMessage: true,
    };

    if (!messagesStore.has(conversationKey)) {
      messagesStore.set(conversationKey, []);
    }
    messagesStore.get(conversationKey).push(message);

    // Confirmación al administrador.
    socket.emit('admin_message_sent', message);

    if (recipientConnection) {
      recipientConnection.socket.emit('receive_admin_message', message);

      recipientConnection.socket.emit('notification', {
        type: 'admin_message',
        title: `Mensaje del administrador ${message.senderUsername}`,
        body:
          message.content.substring(0, 50) +
          (message.content.length > 50 ? '...' : ''),
        data: {
          senderId: admin.userId,
          senderUsername: message.senderUsername,
          conversationId: conversationKey,
        },
      });

      console.log(
        `Admin ${admin.username} envió mensaje a ${recipientConnection.username}`
      );
      return;
    }

    console.log(
      `Admin ${admin.username} guardó un mensaje para ${recipientId} (destinatario desconectado)`
    );
  });
  
  // Manejar solicitud de lista de mensajes
  socket.on('get_conversation', async ({ contactId, token }) => {
    const user = extractUserFromToken(token);
    
    if (!user || !user.userId) {
      socket.emit('error', { message: 'Token inválido' });
      return;
    }
    
    // Buscar conversaciones donde el usuario es participante
    const conversationKey1 = `${user.userId}_${contactId}`;
    const conversationKey2 = `${contactId}_${user.userId}`;
    
    const messages1 = messagesStore.get(conversationKey1) || [];
    const messages2 = messagesStore.get(conversationKey2) || [];
    
    // Unir y ordenar por timestamp
    const allMessages = [...messages1, ...messages2]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    socket.emit('conversation_history', {
      contactId,
      messages: allMessages
    });
  });
  
  // Manejar solicitud de contactos
  socket.on('get_contacts', async (token) => {
    const user = extractUserFromToken(token);
    
    if (!user || !user.userId) {
      socket.emit('error', { message: 'Token inválido' });
      return;
    }
    
    // Obtener todos los usuarios conectados que pueden comunicarse
    const contacts = [];
    
    for (const [, conn] of activeConnections) {
      // No incluir a uno mismo
      if (String(conn.userId) === String(user.userId)) continue;

      /*
       * Aplica las mismas reglas que el backend: la administración solo
       * aparece como contacto del comprador/productor cuando ya inició la
       * conversación (si no, el canal es el ticket de soporte).
       */
      const adminInitiated =
        esAdmin(conn.role) &&
        adminInitiatedConversation(user.userId, conn.userId);

      if (canCommunicate(user.role, conn.role, adminInitiated)) {
        contacts.push({
          userId: conn.userId,
          username: conn.username,
          role: conn.role,
          online: true
        });
      }
    }
    
    socket.emit('contacts_list', contacts);
  });
  
  // Manejar solicitud de lista de tickets (para admin)
  socket.on('get_tickets', async (token) => {
    const user = extractUserFromToken(token);
    
    if (!user || !user.userId || user.role?.toUpperCase() !== 'ADMIN') {
      socket.emit('error', { message: 'Solo los administradores pueden ver los tickets' });
      return;
    }
    
    const tickets = Array.from(ticketsStore.values())
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    socket.emit('tickets_list', tickets);
  });
  
  // Manejar solicitud de detalles de ticket
  socket.on('get_ticket', async ({ ticketId, token }) => {
    const user = extractUserFromToken(token);
    
    if (!user || !user.userId) {
      socket.emit('error', { message: 'Token inválido' });
      return;
    }
    
    const ticket = ticketsStore.get(ticketId);
    
    if (!ticket) {
      socket.emit('error', { message: 'Ticket no encontrado' });
      return;
    }
    
    // Verificar permisos
    const isCreator = ticket.creatorId === user.userId;
    const isAdmin = user.role?.toUpperCase() === 'ADMIN';
    
    if (!isCreator && !isAdmin) {
      socket.emit('error', { message: 'No tienes permiso para ver este ticket' });
      return;
    }
    
    socket.emit('ticket_details', ticket);
  });
  
  // Manejar desconexión
  socket.on('disconnect', () => {
    console.log(`Conexión terminada: ${socket.id}`);
    
    // Eliminar de conexiones activas
    if (activeConnections.has(socket.id)) {
      const conn = activeConnections.get(socket.id);
      const user = conn.user;
      
      activeConnections.delete(socket.id);
      
      console.log(`Usuario desconectado: ${user?.username || socket.id}`);
      
      // Notificar a otros usuarios
      io.emit('user_offline', {
        userId: user?.userId,
        username: user?.username
      });
    }
  });
});

// Endpoint REST para salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor
httpServer.listen(PORT, () => {
  console.log(`Servidor Socket.io escuchando en el puerto ${PORT}`);
  console.log(`Orígenes permitidos: ${process.env.ALLOWED_ORIGINS || 'todos'}`);
});

// Manejar señales de cierre
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  httpServer.close(() => {
    console.log('Servidor cerrado.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido. Cerrando servidor...');
  httpServer.close(() => {
    console.log('Servidor cerrado.');
    process.exit(0);
  });
});
