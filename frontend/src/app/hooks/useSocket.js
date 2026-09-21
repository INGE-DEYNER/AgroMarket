/**
 * Hook personalizado para manejar Socket.io
 * Proporciona una interfaz reactiva para la mensajería en tiempo real
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  initSocket,
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
  getTicket,
  getSocket
} from '@/infrastructure/socket/io';

/**
 * Hook para manejar la conexión Socket.io
 *
 * @param {string} [tokenParam] Token JWT. Si no llega, se usa el token del
 *   localStorage. Aceptar el parámetro evita el desajuste
 *   `useSocket(token)` / `useSocket()` que dejaba el socket sin autenticar.
 * @returns {object} - Objeto con estado y funciones del socket
 */
export function useSocket(tokenParam) {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState(new Map());
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  
  const socketRef = useRef(null);

  // Función para obtener el token actual (prop o localStorage)
  const getCurrentToken = useCallback(() => {
    if (tokenParam) {
      return tokenParam;
    }
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }, [tokenParam]);

  // Inicializar el socket
  useEffect(() => {
    const currentToken = getCurrentToken();
    if (!currentToken) {
      return;
    }

    // Inicializar el socket
    const socket = initSocket(currentToken);
    socketRef.current = socket;

    // Configurar manejadores
    const handlers = {
      onConnect: () => {
        setIsConnected(true);
        setError(null);
        // Autenticar después de conectar
        const token = getCurrentToken();
        if (token) {
          authenticateSocket(token);
        }
      },
      onDisconnect: () => {
        setIsConnected(false);
        setIsAuthenticated(false);
      },
      onAuthSuccess: (data) => {
        setIsAuthenticated(true);
        setError(null);
        // Cargar contactos después de autenticar
        const token = getCurrentToken();
        if (token) {
          getContacts(token);
        }
      },
      onAuthError: (err) => {
        setError(err.message || 'Error de autenticación');
        setIsAuthenticated(false);
      },
      onError: (err) => {
        setError(err.message || 'Error del servidor');
      },
      onConnectError: (err) => {
        setError(err.message || 'Error de conexión');
        setIsConnected(false);
      },
      onReceiveMessage: (message) => {
        setConversations(prev => {
          const newMap = new Map(prev);
          const convKey = `${message.senderId}_${message.recipientId}`;
          if (!newMap.has(convKey)) newMap.set(convKey, []);
          newMap.set(convKey, [...newMap.get(convKey), message]);
          return newMap;
        });
        addNotification({
          type: 'new_message',
          title: `Nuevo mensaje de ${message.senderUsername}`,
          body: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
          data: { senderId: message.senderId, conversationId: `${message.senderId}_${message.recipientId}` }
        });
      },
      onMessageSent: (message) => {
        setConversations(prev => {
          const newMap = new Map(prev);
          const convKey = `${message.senderId}_${message.recipientId}`;
          if (!newMap.has(convKey)) newMap.set(convKey, []);
          newMap.set(convKey, [...newMap.get(convKey), message]);
          return newMap;
        });
      },
      onReceiveAdminMessage: (message) => {
        setConversations(prev => {
          const newMap = new Map(prev);
          const convKey = `${message.senderId}_${message.recipientId}`;
          if (!newMap.has(convKey)) newMap.set(convKey, []);
          newMap.set(convKey, [...newMap.get(convKey), message]);
          return newMap;
        });
        addNotification({
          type: 'admin_message',
          title: `Mensaje del administrador ${message.senderUsername}`,
          body: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
          data: { senderId: message.senderId, conversationId: convKey }
        });
      },
      onAdminMessageSent: (message) => {
        setConversations(prev => {
          const newMap = new Map(prev);
          const convKey = `${message.senderId}_${message.recipientId}`;
          if (!newMap.has(convKey)) newMap.set(convKey, []);
          newMap.set(convKey, [...newMap.get(convKey), message]);
          return newMap;
        });
      },
      onConversationHistory: (data) => {
        setConversations(prev => {
          const newMap = new Map(prev);
          newMap.set(data.contactId, data.messages);
          return newMap;
        });
      },
      onContactsList: (contactsList) => setContacts(contactsList),
      onNewTicket: (ticket) => {
        setTickets(prev => [ticket, ...prev]);
        addNotification({
          type: 'new_ticket',
          title: 'Nuevo ticket',
          body: `Ticket creado por ${ticket.creatorUsername}: ${ticket.subject}`,
          data: { ticketId: ticket.id }
        });
      },
      onTicketCreated: (ticket) => {
        addNotification({
          type: 'ticket_created',
          title: 'Ticket creado',
          body: `Tu ticket "${ticket.subject}" ha sido creado`,
          data: { ticketId: ticket.id }
        });
      },
      onTicketMessage: (data) => {
        setTickets(prev => prev.map(t => 
          t.id === data.ticketId ? { ...t, messages: [...t.messages, data.message], updatedAt: new Date().toISOString() } : t
        ));
        addNotification({
          type: 'ticket_update',
          title: `Actualización en ticket #${data.ticketId}`,
          body: data.message.content.substring(0, 50) + (data.message.content.length > 50 ? '...' : ''),
          data: { ticketId: data.ticketId }
        });
      },
      onTicketMessageSent: (data) => {
        setTickets(prev => prev.map(t => 
          t.id === data.ticketId ? { ...t, messages: [...t.messages, data.message], updatedAt: new Date().toISOString() } : t
        ));
      },
      onTicketsList: (ticketsList) => setTickets(ticketsList),
      onTicketDetails: (ticket) => {
        setTickets(prev => {
          const exists = prev.some(t => t.id === ticket.id);
          return exists ? prev.map(t => t.id === ticket.id ? ticket : t) : [ticket, ...prev];
        });
      },
      onNotification: (notification) => addNotification(notification),
      onUserOnline: (user) => {
        setOnlineUsers(prev => new Set(prev).add(user.userId));
        setContacts(prev => prev.map(c => c.userId === user.userId ? { ...c, online: true } : c));
      },
      onUserOffline: (user) => {
        setOnlineUsers(prev => { const newSet = new Set(prev); newSet.delete(user.userId); return newSet; });
        setContacts(prev => prev.map(c => c.userId === user.userId ? { ...c, online: false } : c));
      }
    };

    setupSocketHandlers(handlers);
    if (socket && !socket.connected) socket.connect();

    return () => {
      disconnectSocket();
      socketRef.current = null;
    };
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
  }, []);

  const markNotificationAsRead = useCallback((index) => {
    setNotifications(prev => {
      const newNotifications = [...prev];
      if (newNotifications[index]) newNotifications[index].read = true;
      return newNotifications;
    });
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const handleSendMessage = useCallback((recipientId, content) => {
    const currentToken = getCurrentToken();
    if (!currentToken) {
      setError('No hay token de autenticación');
      return Promise.reject('No token');
    }
    sendMessage({ recipientId, content, token: currentToken });
    return Promise.resolve();
  }, [getCurrentToken]);

  const handleSendAdminMessage = useCallback((recipientId, content) => {
    const currentToken = getCurrentToken();
    if (!currentToken) {
      setError('No hay token de autenticación');
      return Promise.reject('No token');
    }
    sendAdminMessage({ recipientId, content, token: currentToken });
    return Promise.resolve();
  }, [getCurrentToken]);

  const handleCreateTicket = useCallback((subject, description) => {
    const currentToken = getCurrentToken();
    if (!currentToken) {
      setError('No hay token de autenticación');
      return Promise.reject('No token');
    }
    createTicket({ subject, description, token: currentToken });
    return Promise.resolve();
  }, [getCurrentToken]);

  const handleSendTicketMessage = useCallback((ticketId, content) => {
    const currentToken = getCurrentToken();
    if (!currentToken) {
      setError('No hay token de autenticación');
      return Promise.reject('No token');
    }
    sendTicketMessage({ ticketId, content, token: currentToken });
    return Promise.resolve();
  }, [getCurrentToken]);

  const handleGetConversation = useCallback((contactId) => {
    const currentToken = getCurrentToken();
    if (!currentToken) {
      setError('No hay token de autenticación');
      return;
    }
    getConversation({ contactId, token: currentToken });
  }, [getCurrentToken]);

  const handleGetContacts = useCallback(() => {
    const currentToken = getCurrentToken();
    if (!currentToken) {
      setError('No hay token de autenticación');
      return;
    }
    getContacts(currentToken);
  }, [getCurrentToken]);

  const handleGetTickets = useCallback(() => {
    const currentToken = getCurrentToken();
    if (!currentToken) {
      setError('No hay token de autenticación');
      return;
    }
    getTickets(currentToken);
  }, [getCurrentToken]);

  const handleGetTicket = useCallback((ticketId) => {
    const currentToken = getCurrentToken();
    if (!currentToken) {
      setError('No hay token de autenticación');
      return;
    }
    getTicket({ ticketId, token: currentToken });
  }, [getCurrentToken]);

  const getMessagesForContact = useCallback((contactId) => {
    const convKey = Object.keys([...conversations]).find(key => key.includes(contactId)) || contactId;
    return conversations.get(convKey) || [];
  }, [conversations]);

  const isUserOnline = useCallback((userId) => onlineUsers.has(userId), [onlineUsers]);

  return {
    isConnected,
    isAuthenticated,
    error,
    contacts,
    conversations,
    tickets,
    notifications,
    onlineUsers,
    sendMessage: handleSendMessage,
    sendAdminMessage: handleSendAdminMessage,
    createTicket: handleCreateTicket,
    sendTicketMessage: handleSendTicketMessage,
    getConversation: handleGetConversation,
    getContacts: handleGetContacts,
    getTickets: handleGetTickets,
    getTicket: handleGetTicket,
    getMessagesForContact,
    isUserOnline,
    addNotification,
    markNotificationAsRead,
    clearNotifications,
    socket: getSocket()
  };
}

export default useSocket;
