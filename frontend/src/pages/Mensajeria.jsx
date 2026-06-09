// File: frontend/src/pages/Mensajeria.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { showToast } from '../utils/ui.js';
import Navbar from '../components/Navbar.jsx';
import '../../legacy-css/mensajeria.css'; // Import page styles

export default function Mensajeria() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [contactos, setContactos] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [msgText, setMsgText] = useState('');
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    cargarMensajeria();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  const cargarMensajeria = async () => {
    setLoading(true);
    try {
      const data = await api.getContactos();
      setContactos(data || []);
      if (data && data.length > 0) {
        await openContact(data[0].usuarioId, data);
      }
    } catch (error) {
      console.error("Error al cargar contactos: ", error);
      showToast(t('mensajeria.loadError', 'Error al cargar mensajería. Inténtalo más tarde.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const openContact = async (userId, contactsList = contactos) => {
    const contact = contactsList.find((c) => String(c.usuarioId) === String(userId));
    if (!contact) return;

    setActiveContact(contact);

    try {
      const messages = await api.getConversacion(userId);
      setConversation(messages || []);
    } catch (error) {
      console.error("Error al recuperar conversación: ", error);
    }
  };

  const sendMessage = async () => {
    const text = msgText.trim();
    if (!text || !activeContact) return;

    setMsgText('');
    try {
      await api.enviarMensaje(activeContact.usuarioId, text);
      const messages = await api.getConversacion(activeContact.usuarioId);
      setConversation(messages || []);
      const updatedContacts = await api.getContactos();
      setContactos(updatedContacts || []);
    } catch (error) {
      showToast(error?.message || t('mensajeria.sendError', 'No se pudo enviar el mensaje.'), 'error');
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const initials = (name) => {
    return String(name || '')
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const avatarColor = (index) => {
    const colors = [
      'avatar-green',
      'avatar-blue',
      'avatar-gold',
      'avatar-purple',
      'avatar-red',
    ];
    return colors[index % colors.length];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar />
      
      <div className="chat-layout" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Contact List */}
        <aside className="chat-contacts" style={{ width: '320px', borderRight: '1px solid rgba(45,106,79,.12)', background: '#fff', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>{t('general.cargando', 'Cargando...')}</div>
          ) : contactos.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
              {t('mensajeria.noConversations', 'No hay conversaciones aún.')}
            </div>
          ) : (
            contactos.map((contacto, index) => (
              <div
                key={contacto.usuarioId}
                className={`chat-contact-item ${activeContact?.usuarioId === contacto.usuarioId ? 'active' : ''}`}
                onClick={() => openContact(contacto.usuarioId)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                  borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
                  background: activeContact?.usuarioId === contacto.usuarioId ? '#f0fdf4' : 'transparent',
                  transition: 'background 0.2s'
                }}
              >
                <div className={`avatar ${avatarColor(index)}`} style={{
                  width: '40px', height: '40px', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem'
                }}>
                  {initials(contacto.nombre)}
                </div>
                <div className="chat-contact-info" style={{ flex: 1, minWidth: 0 }}>
                  <div className="contact-name" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a3a2a' }}>{contacto.nombre}</div>
                  <div className="contact-last" style={{ fontSize: '0.78rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {contacto.ultimoMensaje || t('mensajeria.noMessages', 'Sin mensajes')}
                  </div>
                </div>
                {contacto.noLeidos > 0 && (
                  <span className="badge badge-green" style={{ background: '#2d6a4f', color: '#fff', borderRadius: '999px', padding: '2px 6px', fontSize: '0.7rem' }}>
                    {contacto.noLeidos}
                  </span>
                )}
              </div>
            ))
          )}
        </aside>

        {/* Chat Window */}
        <div className="chat-window" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8faf8', overflow: 'hidden' }}>
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="chat-header" style={{
                padding: '16px 24px', background: '#fff', borderBottom: '1px solid rgba(45,106,79,.12)',
                display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <div className={`avatar ${avatarColor(contactos.findIndex(c => c.usuarioId === activeContact.usuarioId))}`} style={{
                  width: '40px', height: '40px', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff'
                }}>
                  {initials(activeContact.nombre)}
                </div>
                <div>
                  <div className="chat-name" style={{ fontWeight: 700, color: '#1a3a2a' }}>{activeContact.nombre}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {activeContact.rol || t('general.user', 'Usuario')}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span className="badge badge-green" style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '999px', fontWeight: 600 }}>
                    {t('mensajeria.online', '● En línea')}
                  </span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="chat-messages" style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {conversation.length === 0 ? (
                  <div className="empty-state" style={{ margin: 'auto', textAlign: 'center' }}>
                    <div className="empty-icon" style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💬</div>
                    <div style={{ color: '#6b7280' }}>
                      {t('mensajeria.noMessagesGreeting', 'No hay mensajes todavía. ¡Envía un mensaje de saludo!')}
                    </div>
                  </div>
                ) : (
                  conversation.map((mensaje) => {
                    const isOut = Number(mensaje.remitenteId) === Number(user?.id);
                    return (
                      <div key={mensaje.id} className={`msg ${isOut ? 'out' : 'in'}`} style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: isOut ? 'flex-end' : 'flex-start'
                      }}>
                        <div className="msg-bubble" style={{
                          background: isOut ? '#2d6a4f' : '#fff',
                          color: isOut ? '#fff' : '#1a3a2a',
                          padding: '10px 16px', borderRadius: '14px',
                          borderTopRightRadius: isOut ? '2px' : '14px',
                          borderTopLeftRadius: isOut ? '14px' : '2px',
                          maxWidth: '60%',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                          border: isOut ? 'none' : '1px solid rgba(45,106,79,.08)'
                        }}>
                          {mensaje.contenido}
                        </div>
                        <div className="msg-time" style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>
                          {new Date(mensaje.fechaEnvio).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="chat-input-bar" style={{ padding: '16px 24px', background: '#fff', borderTop: '1px solid rgba(45,106,79,.12)', display: 'flex', gap: '12px' }}>
                <input
                  className="chat-input"
                  placeholder={t('mensajeria.inputPlaceholder', 'Escribe un mensaje...')}
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  onKeyDown={handleKey}
                  style={{
                    flex: 1, padding: '12px 16px', borderRadius: '12px',
                    border: '1px solid rgba(45,106,79,.2)', fontSize: '0.95rem', outline: 'none'
                  }}
                />
                <button
                  className="btn btn-primary"
                  onClick={sendMessage}
                  disabled={!msgText.trim()}
                  style={{
                    padding: '12px 20px', borderRadius: '12px', border: 0,
                    background: '#2d6a4f', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center'
                  }}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ margin: 'auto', textAlign: 'center' }}>
              <div className="empty-icon" style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
              <div style={{ color: '#6b7280', fontWeight: 600 }}>
                {t('mensajeria.selectContactToStart', 'Selecciona un contacto para iniciar la conversación.')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}