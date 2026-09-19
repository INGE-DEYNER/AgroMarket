import { useState, useEffect, useRef, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";
import { useSocket } from "@/app/hooks/useSocket";
import BuyerShell from "@/presentation/features/order/components/BuyerShell";
import api, { API_BASE } from "@/infrastructure/http/api";
import { normalizarMensaje as normalizarMensajeBase } from "@/infrastructure/normalizar";
import "@/presentation/styles/mensajeria.css";

export default function Mensajeria() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');

  const {
    isConnected,
    isAuthenticated,
    error: socketError,
    contacts,
    conversations,
    tickets,
    notifications,
    onlineUsers,
    sendMessage,
    sendAdminMessage,
    createTicket,
    sendTicketMessage,
    getConversation,
    getContacts,
    getMessagesForContact,
    isUserOnline,
    clearNotifications
  } = useSocket(token);

  const [selectedContact, setSelectedContact] = useState(null);
  const [msgInput, setMsgInput] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessageInput, setTicketMessageInput] = useState('');
  
  const chatRef = useRef(null);
  const ticketChatRef = useRef(null);

  const normalizarMensaje = (m) => normalizarMensajeBase(m, user?.id);
  const messages = selectedContact ? getMessagesForContact(selectedContact.userId) : [];
  const ticketMessages = selectedTicket ? selectedTicket.messages : [];

  const scrollChat = () => {
    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }, 100);
  };

  const scrollTicketChat = () => {
    setTimeout(() => {
      if (ticketChatRef.current) {
        ticketChatRef.current.scrollTop = ticketChatRef.current.scrollHeight;
      }
    }, 100);
  };

  useEffect(() => {
    if (selectedContact) {
      getConversation(selectedContact.userId);
    }
  }, [selectedContact, getConversation]);

  useEffect(() => {
    scrollChat();
  }, [messages]);

  useEffect(() => {
    scrollTicketChat();
  }, [ticketMessages]);

  useEffect(() => {
    if (isAuthenticated) {
      getContacts();
    }
  }, [isAuthenticated, getContacts]);

  if (user) {
    const role = user.role?.toLowerCase();
    if (role === "productor") {
      return <Navigate to="/dashboard-productor?section=mensajeria" replace />;
    } else if (role === "admin") {
      return <Navigate to="/admin" replace />;
    }
  }

  const handleSendMessage = async () => {
    if (!msgInput.trim() || !selectedContact) return;
    
    const content = msgInput;
    setMsgInput('');
    
    try {
      if (user?.role?.toUpperCase() === 'ADMIN') {
        await sendAdminMessage(selectedContact.userId, content);
      } else {
        await sendMessage(selectedContact.userId, content);
      }
    } catch (err) {
      console.error('Error enviando mensaje:', err);
    }
    
    scrollChat();
  };

  const handleSendTicketMessage = async () => {
    if (!ticketMessageInput.trim() || !selectedTicket) return;
    
    const content = ticketMessageInput;
    setTicketMessageInput('');
    
    try {
      await sendTicketMessage(selectedTicket.id, content);
    } catch (err) {
      console.error('Error enviando mensaje en ticket:', err);
    }
    
    scrollTicketChat();
  };

  const handleCreateNewTicket = async () => {
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;
    
    try {
      await createTicket(ticketSubject, ticketDescription);
      setShowCreateTicket(false);
      setTicketSubject('');
      setTicketDescription('');
    } catch (err) {
      console.error('Error creando ticket:', err);
    }
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setActiveTab('chat');
  };

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setActiveTab('tickets');
  };

  const formatMessage = (msg) => {
    const isMine = String(msg.senderId) === String(user?.id);
    return {
      ...msg,
      mio: isMine,
      texto: msg.content || msg.contenido,
      hora: msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    };
  };

  const filteredContacts = user?.role?.toUpperCase() === 'ADMIN' 
    ? contacts.filter(c => ['COMPRADOR', 'BUYER', 'COMPRADOR_EMPRESA', 'BUYER_COMPANY', 'PRODUCTOR', 'PRODUCER'].includes(c.role?.toUpperCase()))
    : contacts;

  const NotificationCenter = () => (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      maxWidth: '350px',
      width: '100%'
    }}>
      {notifications.length > 0 && (
        <div style={{
          background: 'var(--card-bg)',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <h4 style={{
              fontSize: '0.85rem',
              fontWeight: '600',
              color: 'var(--text-1)'
            }}>
              {t('notifications.title', 'Notificaciones')}
            </h4>
            <button
              onClick={clearNotifications}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                padding: '4px'
              }}
            >
              {t('notifications.clear', 'Limpiar')}
            </button>
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.map((notif, index) => (
              <div
                key={index}
                style={{
                  padding: '10px',
                  marginBottom: '8px',
                  background: notif.read ? 'transparent' : 'var(--primary-bg)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-light)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: 'var(--text-1)',
                  marginBottom: '4px'
                }}>
                  {notif.title}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {notif.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const CreateTicketModal = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }} onClick={() => setShowCreateTicket(false)}>
      <div style={{
        background: 'var(--card-bg)',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <h2 style={{
          fontSize: '1.2rem',
          fontWeight: '600',
          marginBottom: '20px',
          color: 'var(--text-1)'
        }}>
          {t('tickets.createTitle', 'Crear Ticket de Soporte')}
        </h2>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: '500',
            marginBottom: '6px',
            color: 'var(--text-1)'
          }}>
            {t('tickets.subject', 'Asunto')}
          </label>
          <input
            type="text"
            value={ticketSubject}
            onChange={(e) => setTicketSubject(e.target.value)}
            placeholder={t('tickets.subjectPlaceholder', 'Ej: Problema con el pago')}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border-light)',
              borderRadius: '6px',
              fontSize: '0.9rem',
              background: 'var(--surface-1)',
              color: 'var(--text-1)'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: '500',
            marginBottom: '6px',
            color: 'var(--text-1)'
          }}>
            {t('tickets.description', 'Descripcion')}
          </label>
          <textarea
            value={ticketDescription}
            onChange={(e) => setTicketDescription(e.target.value)}
            placeholder={t('tickets.descriptionPlaceholder', 'Describe tu problema con detalle...')}
            rows={5}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border-light)',
              borderRadius: '6px',
              fontSize: '0.9rem',
              background: 'var(--surface-1)',
              color: 'var(--text-1)',
              resize: 'vertical'
            }}
          />
        </div>
        
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => setShowCreateTicket(false)}
            style={{
              padding: '10px 20px',
              border: '1px solid var(--border-light)',
              borderRadius: '6px',
              background: 'transparent',
              color: 'var(--text-1)',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {t('common.cancel', 'Cancelar')}
          </button>
          <button
            onClick={handleCreateNewTicket}
            disabled={!ticketSubject.trim() || !ticketDescription.trim()}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              background: 'var(--primary)',
              color: '#fff',
              cursor: !ticketSubject.trim() || !ticketDescription.trim() ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              opacity: !ticketSubject.trim() || !ticketDescription.trim() ? 0.6 : 1
            }}
          >
            {t('tickets.create', 'Crear Ticket')}
          </button>
        </div>
      </div>
    </div>
  );

  const ConnectionStatus = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      background: isConnected ? 'var(--success-bg)' : 'var(--danger-bg)',
      borderRadius: '6px',
      marginBottom: '16px',
      fontSize: '0.75rem'
    }}>
      <span style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: isConnected ? 'var(--success)' : 'var(--danger)',
        display: 'inline-block'
      }} />
      <span style={{ color: 'var(--text-1)' }}>
        {isConnected 
          ? t('socket.connected', 'Conectado a mensajeria en tiempo real')
          : t('socket.disconnected', 'Desconectado - Reintentando...')
        }
      </span>
      {!isAuthenticated && (
        <span style={{ color: 'var(--warning)' }}>
          ({t('socket.notAuthenticated', 'No autenticado')})
        </span>
      )}
    </div>
  );

  return (
    <BuyerShell activeKey="mensajeria">
      <div className="buyer-page-content">
        <NotificationCenter />
        {showCreateTicket && <CreateTicketModal />}
        
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-light)'
        }}>
          <h1 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            color: 'var(--text-1)',
            marginBottom: '8px'
          }}>
            {t('mensajeria.title', 'Mensajeria')}
          </h1>
          <ConnectionStatus />
        </div>

        <div className="chat-layout" style={{
          display: 'flex',
          height: 'calc(100vh - 200px)',
          overflow: 'hidden'
        }}>
          <div className="chat-contacts" style={{
            width: '280px',
            borderRight: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--surface-1)'
          }}>
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-light)',
              padding: '8px 0'
            }}>
              <button
                onClick={() => setActiveTab('chat')}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: activeTab === 'chat' ? '600' : '500',
                  color: activeTab === 'chat' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'chat' ? '2px solid var(--primary)' : 'none'
                }}
              >
                {t('mensajeria.chat', 'Chat')}
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: activeTab === 'tickets' ? '600' : '500',
                  color: activeTab === 'tickets' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'tickets' ? '2px solid var(--primary)' : 'none'
                }}
              >
                {t('tickets.title', 'Tickets')}
              </button>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px 0'
            }}>
              {activeTab === 'chat' ? (
                <>
                  {user?.role?.toUpperCase() !== 'ADMIN' && (
                    <div style={{
                      padding: '8px 12px',
                      margin: '8px 12px',
                      background: 'var(--primary)',
                      color: '#fff',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      textAlign: 'center',
                      fontWeight: '500'
                    }} onClick={() => setShowCreateTicket(true)}>
                      + {t('tickets.createTicket', 'Crear Ticket')}
                    </div>
                  )}
                  
                  {filteredContacts.length === 0 ? (
                    <div style={{
                      padding: '40px 12px',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem'
                    }}>
                      {t('mensajeria.noContacts', 'No hay contactos disponibles')}
                    </div>
                  ) : (
                    filteredContacts.map((c) => (
                      <div
                        key={c.userId}
                        onClick={() => handleSelectContact(c)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '14px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border-light)',
                          background: selectedContact?.userId === c.userId ? 'var(--primary-bg)' : 'transparent',
                          transition: 'background 0.2s'
                        }}
                      >
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--primary)',
                          color: '#fff',
                          fontWeight: '600',
                          fontSize: '0.85rem'
                        }}>
                          {c.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div style={{
                          flex: 1,
                          minWidth: 0
                        }}>
                          <div style={{
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            color: 'var(--text-1)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {c.username}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)'
                          }}>
                            {t(`auth.${c.role?.toLowerCase()}`, c.role)}
                          </div>
                        </div>
                        {isUserOnline(c.userId) && (
                          <span style={{
                            marginLeft: 'auto',
                            fontSize: '0.65rem',
                            background: 'var(--success)',
                            color: '#fff',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            ● {t('mensajeria.online', 'En linea')}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </>
              ) : (
                <>
                  {tickets.length === 0 ? (
                    <div style={{
                      padding: '40px 12px',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem'
                    }}>
                      {user?.role?.toUpperCase() !== 'ADMIN' ? (
                        <>
                          <button
                            onClick={() => setShowCreateTicket(true)}
                            style={{
                              background: 'var(--primary)',
                              color: '#fff',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            + {t('tickets.createTicket', 'Crear Ticket')}
                          </button>
                          <div style={{ marginTop: '12px' }}>
                            {t('tickets.noOwnTickets', 'No tienes tickets creados')}
                          </div>
                        </>
                      ) : (
                        t('tickets.noTickets', 'No hay tickets')
                      )}
                    </div>
                  ) : (
                    tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => handleSelectTicket(ticket)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '14px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border-light)',
                          background: selectedTicket?.id === ticket.id ? 'var(--primary-bg)' : 'transparent',
                          transition: 'background 0.2s'
                        }}
                      >
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: ticket.status === 'OPEN' ? 'var(--warning)' : 'var(--success)',
                          color: '#fff',
                          fontWeight: '600',
                          fontSize: '0.85rem'
                        }}>
                          T
                        </div>
                        <div style={{
                          flex: 1,
                          minWidth: 0
                        }}>
                          <div style={{
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            color: 'var(--text-1)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {ticket.subject}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)'
                          }}>
                            {ticket.creatorUsername} - {ticket.status}
                          </div>
                        </div>
                        <div style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap'
                        }}>
                          {ticket.messages?.length || 0} msgs
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>

          <div className="chat-window" style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--surface-1)'
          }}>
            <div className="chat-header" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-light)',
              background: 'var(--card-bg)'
            }}>
              {activeTab === 'chat' ? (
                <>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}>
                    {selectedContact?.username?.charAt(0).toUpperCase() || '--'}
                  </div>
                  <div>
                    <div style={{
                      fontWeight: '600',
                      fontSize: '1rem',
                      color: 'var(--text-1)'
                    }}>
                      {selectedContact?.username || t('mensajeria.selectContact', 'Selecciona un contacto')}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)'
                    }}>
                      {selectedContact?.role}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    {selectedContact && isUserOnline(selectedContact.userId) && (
                      <span style={{
                        background: 'var(--success)',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem'
                      }}>
                        ● {t('mensajeria.online', 'En linea')}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: selectedTicket?.status === 'OPEN' ? 'var(--warning)' : 'var(--success)',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}>
                    T
                  </div>
                  <div>
                    <div style={{
                      fontWeight: '600',
                      fontSize: '1rem',
                      color: 'var(--text-1)'
                    }}>
                      {selectedTicket?.subject || t('tickets.selectTicket', 'Selecciona un ticket')}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)'
                    }}>
                      {selectedTicket?.creatorUsername} - {selectedTicket?.status}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    {selectedTicket && (
                      <span style={{
                        background: selectedTicket.status === 'OPEN' ? 'var(--warning)' : 'var(--success)',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem'
                      }}>
                        {selectedTicket.status}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="chat-messages" ref={activeTab === 'chat' ? chatRef : ticketChatRef} style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px',
              background: 'var(--surface-1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {activeTab === 'chat' ? (
                !selectedContact ? (
                  <div style={{ margin: 'auto', textAlign: 'center' }}>
                    <div style={{ color: 'var(--primary)', marginBottom: '16px' }}>
                      <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
                      </svg>
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-muted)',
                      textAlign: 'center'
                    }}>
                      {t('mensajeria.selectContact', 'Selecciona un contacto para iniciar la conversacion.')}
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ margin: 'auto', textAlign: 'center' }}>
                    <div style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-muted)',
                      textAlign: 'center'
                    }}>
                      {t('mensajeria.emptyMessages', 'No hay mensajes aun. Se el primero en escribir!')}
                    </div>
                  </div>
                ) : (
                  messages.map((m) => {
                    const formatted = formatMessage(m);
                    return (
                      <div
                        key={m.id || Math.random()}
                        style={{
                          display: 'flex',
                          justifyContent: formatted.mio ? 'flex-end' : 'flex-start',
                          marginBottom: '12px',
                          padding: '0 16px',
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '70%',
                            background: formatted.mio ? 'var(--primary)' : 'var(--card-bg)',
                            color: formatted.mio ? '#fff' : 'inherit',
                            padding: '10px 14px',
                            borderRadius: formatted.mio ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            border: formatted.mio ? 'none' : '1px solid var(--border-light)',
                          }}
                        >
                          <div>{formatted.texto || formatted.content}</div>
                          <div
                            style={{
                              fontSize: '0.65rem',
                              opacity: 0.7,
                              marginTop: '4px',
                              textAlign: 'right',
                            }}
                          >
                            {formatted.hora}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                !selectedTicket ? (
                  <div style={{ margin: 'auto', textAlign: 'center' }}>
                    <div style={{ color: 'var(--primary)', marginBottom: '16px' }}>
                      <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-muted)',
                      textAlign: 'center'
                    }}>
                      {t('tickets.selectTicket', 'Selecciona un ticket para ver los mensajes')}
                    </div>
                  </div>
                ) : ticketMessages.length === 0 ? (
                  <div style={{ margin: 'auto', textAlign: 'center' }}>
                    <div style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-muted)',
                      textAlign: 'center'
                    }}>
                      {selectedTicket.description}
                      <div style={{ marginTop: '16px' }}>
                        {t('tickets.noMessages', 'No hay mensajes en este ticket aun')}
                      </div>
                    </div>
                  </div>
                ) : (
                  ticketMessages.map((m) => {
                    const isMine = String(m.senderId) === String(user?.id);
                    return (
                      <div
                        key={m.id || Math.random()}
                        style={{
                          display: 'flex',
                          justifyContent: isMine ? 'flex-end' : 'flex-start',
                          marginBottom: '12px',
                          padding: '0 16px',
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '70%',
                            background: isMine ? 'var(--primary)' : 'var(--card-bg)',
                            color: isMine ? '#fff' : 'inherit',
                            padding: '10px 14px',
                            borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            border: isMine ? 'none' : '1px solid var(--border-light)',
                          }}
                        >
                          <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                            {m.senderUsername} ({m.senderRole})
                          </div>
                          <div>{m.content}</div>
                          <div
                            style={{
                              fontSize: '0.65rem',
                              opacity: 0.7,
                              marginTop: '4px',
                              textAlign: 'right',
                            }}
                          >
                            {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>

            {activeTab === 'chat' ? (
              <div style={{
                display: 'flex',
                gap: '12px',
                padding: '16px 20px',
                borderTop: '1px solid var(--border-light)',
                background: 'var(--card-bg)'
              }}>
                <input
                  placeholder={t('mensajeria.typeMessage', 'Escribe un mensaje...')}
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={!selectedContact || !isConnected}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    background: 'var(--surface-1)',
                    color: 'var(--text-1)'
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!selectedContact || !msgInput.trim() || !isConnected}
                  style={{
                    padding: '10px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    background: !selectedContact || !msgInput.trim() || !isConnected ? 'var(--border-light)' : 'var(--primary)',
                    color: !selectedContact || !msgInput.trim() || !isConnected ? 'var(--text-muted)' : '#fff',
                    cursor: !selectedContact || !msgInput.trim() || !isConnected ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t('mensajeria.send', 'Enviar')}
                </button>
              </div>
            ) : (
              selectedTicket && (
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '16px 20px',
                  borderTop: '1px solid var(--border-light)',
                  background: 'var(--card-bg)'
                }}>
                  <input
                    placeholder={t('tickets.typeMessage', 'Escribe una respuesta...')}
                    value={ticketMessageInput}
                    onChange={(e) => setTicketMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendTicketMessage();
                      }
                    }}
                    disabled={!isConnected}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      background: 'var(--surface-1)',
                      color: 'var(--text-1)'
                    }}
                  />
                  <button
                    onClick={handleSendTicketMessage}
                    disabled={!ticketMessageInput.trim() || !isConnected}
                    style={{
                      padding: '10px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      background: !ticketMessageInput.trim() || !isConnected ? 'var(--border-light)' : 'var(--primary)',
                      color: !ticketMessageInput.trim() || !isConnected ? 'var(--text-muted)' : '#fff',
                      cursor: !ticketMessageInput.trim() || !isConnected ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t('tickets.send', 'Responder')}
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </BuyerShell>
  );
}
