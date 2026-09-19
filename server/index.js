import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

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

// Función para extraer información del token JWT (simplificado)
// En producción, validar contra el backend Spring
function extractUserFromToken(token) {
  if (!token) return null;
  
  try {
    // Decodificar JWT manualmente (simplificado)
    // En producción, usar jwt.verify() o validar contra el backend
    const base64Payload = token.split('.')[1];
    const payload = Buffer.from(base64Payload, 'base64').toString('utf-8');
    const payloadObj = JSON.parse(payload);
    
    return {
      userId: payloadObj.sub || payloadObj.userId,
      username: payloadObj.username || payloadObj.sub,
      role: payloadObj.role || payloadObj.rol,
      email: payloadObj.email
    };
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
}

// Validar si un rol puede comunicarse con otro
function canCommunicate(senderRole, receiverRole) {
  // Normalizar roles
  const sender = (senderRole || '').toUpperCase();
  const receiver = (receiverRole || '').toUpperCase();
  
  // Comprador y Productor pueden comunicarse entre sí
  const buyerRoles = ['COMPRADOR', 'BUYER', 'COMPRADOR_EMPRESA', 'BUYER_COMPANY'];
  const producerRoles = ['PRODUCTOR', 'PRODUCER'];
  
  if (buyerRoles.includes(sender) && producerRoles.includes(receiver)) {
    return true;
  }
  if (producerRoles.includes(sender) && buyerRoles.includes(receiver)) {
    return true;
  }
  
  // Admin puede enviar mensajes a Comprador y Vendedor
  if (sender === 'ADMIN' && (buyerRoles.includes(receiver) || producerRoles.includes(receiver))) {
    return true;
  }
  
  // Comprador/Vendedor NO pueden iniciar comunicación con Admin directamente
  // Solo a través de tickets
  if ((buyerRoles.includes(sender) || producerRoles.includes(sender)) && receiver === 'ADMIN') {
    return false;
  }
  
  return false;
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
  
  // Manejar mensaje directo
  socket.on('send_message', async ({ recipientId, content, token }) => {
    const sender = extractUserFromToken(token);
    
    if (!sender || !sender.userId) {
      socket.emit('error', { message: 'Token inválido' });
      return;
    }
    
    // Buscar la conexión del destinatario
    let recipientConnection = null;
    for (const [, conn] of activeConnections) {
      if (conn.userId === recipientId) {
        recipientConnection = conn;
        break;
      }
    }
    
    if (!recipientConnection) {
      socket.emit('error', { message: 'Destinatario no conectado' });
      return;
    }
    
    // Verificar si el remitente puede comunicarse con el destinatario
    if (!canCommunicate(sender.role, recipientConnection.role)) {
      socket.emit('error', { 
        message: 'No puedes enviar mensajes a este usuario',
        reason: 'comunicacion_no_permitida'
      });
      return;
    }
    
    // Crear el mensaje
    const messageId = Date.now().toString();
    const timestamp = new Date().toISOString();
    
    const message = {
      id: messageId,
      senderId: sender.userId,
      senderUsername: sender.username,
      senderRole: sender.role,
      recipientId,
      recipientRole: recipientConnection.role,
      content,
      timestamp,
      read: false
    };
    
    // Almacenar el mensaje
    const conversationKey = `${sender.userId}_${recipientId}`;
    if (!messagesStore.has(conversationKey)) {
      messagesStore.set(conversationKey, []);
    }
    messagesStore.get(conversationKey).push(message);
    
    // Enviar al destinatario
    recipientConnection.socket.emit('receive_message', message);
    
    // Confirmación al remitente
    socket.emit('message_sent', message);
    
    // Notificación al destinatario
    recipientConnection.socket.emit('notification', {
      type: 'new_message',
      title: `Nuevo mensaje de ${sender.username}`,
      body: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      data: {
        senderId: sender.userId,
        senderUsername: sender.username,
        conversationId: conversationKey
      }
    });
    
    console.log(`Mensaje enviado de ${sender.username} a ${recipientConnection.username}`);
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
    
    if (!admin || !admin.userId || admin.role?.toUpperCase() !== 'ADMIN') {
      socket.emit('error', { message: 'Solo los administradores pueden usar este canal' });
      return;
    }
    
    // Buscar la conexión del destinatario
    let recipientConnection = null;
    for (const [, conn] of activeConnections) {
      if (conn.userId === recipientId) {
        recipientConnection = conn;
        break;
      }
    }
    
    if (!recipientConnection) {
      socket.emit('error', { message: 'Destinatario no conectado' });
      return;
    }
    
    // Verificar que el destinatario es Comprador o Vendedor
    if (!['COMPRADOR', 'BUYER', 'COMPRADOR_EMPRESA', 'BUYER_COMPANY', 'PRODUCTOR', 'PRODUCER'].includes(recipientConnection.role?.toUpperCase())) {
      socket.emit('error', { message: 'Solo puedes enviar mensajes a compradores o vendedores' });
      return;
    }
    
    // Crear el mensaje
    const messageId = Date.now().toString();
    const timestamp = new Date().toISOString();
    
    const message = {
      id: messageId,
      senderId: admin.userId,
      senderUsername: admin.username,
      senderRole: admin.role,
      recipientId,
      recipientRole: recipientConnection.role,
      content,
      timestamp,
      read: false,
      isAdminMessage: true
    };
    
    // Almacenar el mensaje
    const conversationKey = `${admin.userId}_${recipientId}`;
    if (!messagesStore.has(conversationKey)) {
      messagesStore.set(conversationKey, []);
    }
    messagesStore.get(conversationKey).push(message);
    
    // Enviar al destinatario
    recipientConnection.socket.emit('receive_admin_message', message);
    
    // Confirmación al admin
    socket.emit('admin_message_sent', message);
    
    // Notificación al destinatario
    recipientConnection.socket.emit('notification', {
      type: 'admin_message',
      title: `Mensaje del administrador ${admin.username}`,
      body: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      data: {
        senderId: admin.userId,
        senderUsername: admin.username,
        conversationId: conversationKey
      }
    });
    
    console.log(`Admin ${admin.username} envió mensaje a ${recipientConnection.username}`);
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
      if (conn.userId === user.userId) continue;
      
      // Verificar si se puede comunicar
      if (canCommunicate(user.role, conn.role)) {
        contacts.push({
          userId: conn.userId,
          username: conn.username,
          role: conn.role,
          online: true
        });
      }
    }
    
    // Si es admin, puede ver a todos los compradores y vendedores
    if (user.role?.toUpperCase() === 'ADMIN') {
      for (const [, conn] of activeConnections) {
        if (conn.userId === user.userId) continue;
        if (['COMPRADOR', 'BUYER', 'COMPRADOR_EMPRESA', 'BUYER_COMPANY', 'PRODUCTOR', 'PRODUCER'].includes(conn.role?.toUpperCase())) {
          // Verificar si ya está en la lista
          if (!contacts.some(c => c.userId === conn.userId)) {
            contacts.push({
              userId: conn.userId,
              username: conn.username,
              role: conn.role,
              online: true
            });
          }
        }
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
