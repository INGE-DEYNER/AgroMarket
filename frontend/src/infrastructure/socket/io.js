/**
 * Configuración de Socket.io para el cliente
 * Conecta al servidor Node.js + Socket.io para mensajería en tiempo real
 */

import { io } from 'socket.io-client';

// URL del servidor Socket.io
// En desarrollo: localhost:3001
// En producción: debe configurarse según el entorno
const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:3001';

// Crear conexión Socket.io
let socket;

/**
 * Inicializar la conexión Socket.io
 * @param {string} token - Token JWT para autenticación
 * @returns {object} - Instancia del socket
 */
export function initSocket(token) {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    autoConnect: false,
    auth: (cb) => {
      cb({ token });
    }
  });

  return socket;
}

/**
 * Obtener la instancia del socket actual
 * @returns {object|null} - Instancia del socket o null si no está inicializado
 */
export function getSocket() {
  return socket || null;
}

/**
 * Autenticar el socket con un token
 * @param {string} token - Token JWT
 */
export function authenticateSocket(token) {
  if (!socket) {
    initSocket(token);
  }

  if (socket && !socket.connected) {
    socket.connect();
  }

  socket.emit('authenticate', token);
}

/**
 * Desconectar el socket
 */
export function disconnectSocket() {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}

/**
 * Suscribirse a eventos del socket
 * @param {object} handlers - Objeto con manejadores de eventos
 */
export function setupSocketHandlers(handlers) {
  if (!socket) {
    initSocket();
  }

  // Autenticación
  socket.on('auth_success', handlers.onAuthSuccess || (() => {}));
  socket.on('auth_error', handlers.onAuthError || (() => {}));

  // Mensajes
  socket.on('receive_message', handlers.onReceiveMessage || (() => {}));
  socket.on('message_sent', handlers.onMessageSent || (() => {}));
  socket.on('receive_admin_message', handlers.onReceiveAdminMessage || (() => {}));
  socket.on('admin_message_sent', handlers.onAdminMessageSent || (() => {}));

  // Conversaciones
  socket.on('conversation_history', handlers.onConversationHistory || (() => {}));
  socket.on('contacts_list', handlers.onContactsList || (() => {}));

  // Tickets
  socket.on('ticket_created', handlers.onTicketCreated || (() => {}));
  socket.on('new_ticket', handlers.onNewTicket || (() => {}));
  socket.on('ticket_message', handlers.onTicketMessage || (() => {}));
  socket.on('ticket_message_sent', handlers.onTicketMessageSent || (() => {}));
  socket.on('tickets_list', handlers.onTicketsList || (() => {}));
  socket.on('ticket_details', handlers.onTicketDetails || (() => {}));

  // Notificaciones
  socket.on('notification', handlers.onNotification || (() => {}));

  // Estado de usuarios
  socket.on('user_online', handlers.onUserOnline || (() => {}));
  socket.on('user_offline', handlers.onUserOffline || (() => {}));

  // Errores
  socket.on('error', handlers.onError || (() => {}));
  socket.on('connect_error', handlers.onConnectError || (() => {}));

  // Conexión/Desconexión
  socket.on('connect', handlers.onConnect || (() => {}));
  socket.on('disconnect', handlers.onDisconnect || (() => {}));
}

/**
 * Enviar un mensaje directo
 * @param {object} messageData - Datos del mensaje
 * @param {string} messageData.recipientId - ID del destinatario
 * @param {string} messageData.content - Contenido del mensaje
 * @param {string} messageData.token - Token JWT
 */
export function sendMessage(messageData) {
  if (socket && socket.connected) {
    socket.emit('send_message', messageData);
  }
}

/**
 * Enviar mensaje como admin
 * @param {object} messageData - Datos del mensaje
 */
export function sendAdminMessage(messageData) {
  if (socket && socket.connected) {
    socket.emit('admin_send_message', messageData);
  }
}

/**
 * Obtener historial de conversación
 * @param {object} data - Datos de la solicitud
 * @param {string} data.contactId - ID del contacto
 * @param {string} data.token - Token JWT
 */
export function getConversation(data) {
  if (socket && socket.connected) {
    socket.emit('get_conversation', data);
  }
}

/**
 * Obtener lista de contactos
 * @param {string} token - Token JWT
 */
export function getContacts(token) {
  if (socket && socket.connected) {
    socket.emit('get_contacts', token);
  }
}

/**
 * Crear un ticket
 * @param {object} data - Datos del ticket
 * @param {string} data.subject - Asunto
 * @param {string} data.description - Descripción
 * @param {string} data.token - Token JWT
 */
export function createTicket(data) {
  if (socket && socket.connected) {
    socket.emit('create_ticket', data);
  }
}

/**
 * Enviar mensaje en un ticket
 * @param {object} data - Datos del mensaje
 * @param {string} data.ticketId - ID del ticket
 * @param {string} data.content - Contenido
 * @param {string} data.token - Token JWT
 */
export function sendTicketMessage(data) {
  if (socket && socket.connected) {
    socket.emit('send_ticket_message', data);
  }
}

/**
 * Obtener lista de tickets (solo admin)
 * @param {string} token - Token JWT
 */
export function getTickets(token) {
  if (socket && socket.connected) {
    socket.emit('get_tickets', token);
  }
}

/**
 * Obtener detalles de un ticket
 * @param {object} data - Datos de la solicitud
 * @param {string} data.ticketId - ID del ticket
 * @param {string} data.token - Token JWT
 */
export function getTicket(data) {
  if (socket && socket.connected) {
    socket.emit('get_ticket', data);
  }
}

export default {
  initSocket,
  getSocket,
  authenticateSocket,
  disconnectSocket,
  setupSocketHandlers,
  sendMessage,
  sendAdminMessage,
  getConversation,
  getContacts,
  createTicket,
  sendTicketMessage,
  getTickets,
  getTicket
};
