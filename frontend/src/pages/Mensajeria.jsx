import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/styles.css';
import '../styles/mensajeria.css';

export default function Mensajeria() {
  const { user, logout } = useAuth();

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
      console.error("Error al enviar mensaje: ", error);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión: ", error);
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
    <div className="page-wrap" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* NAVBAR */}
      <nav className="navbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '64px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <Link className="navbar-brand" to="/dashboard-comprador" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit', fontWeight: 700, fontSize: '1.25rem' }}>
          <span className="logo-icon">🌿</span>
          <span>AgroMarket</span>
        </Link>
        <div className="navbar-links" style={{ display: 'flex', gap: '24px' }}>
          <Link to="/dashboard-comprador" style={{ textDecoration: 'none', color: 'inherit' }}>Mi Panel</Link>
          <Link to="/catalogo" style={{ textDecoration: 'none', color: 'inherit' }}>Catálogo</Link>
          <Link to="/pedidos" style={{ textDecoration: 'none', color: 'inherit' }}>Pedidos</Link>
          <Link to="/mensajeria" className="active" style={{ textDecoration: 'none', color: 'inherit' }}>Mensajes</Link>
          <Link to="/envios" style={{ textDecoration: 'none', color: 'inherit' }}>Envíos</Link>
        </div>
        <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="avatar avatar-blue">--</div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '0.875rem' }}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* CHAT LAYOUT */}
      <div className="chat-layout" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* CONTACTS */}
        <div className="chat-contacts" style={{ width: '320px', borderRight: '1px solid rgba(45,106,79,.12)', background: '#fff', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Cargando...</div>
          ) : contactos.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
              No hay conversaciones aún.
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
                    {contacto.ultimoMensaje || 'Sin mensajes'}
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
        </div>

        {/* WINDOW */}
        <div className="chat-window" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8faf8', overflow: 'hidden' }}>
          {/* Chat Header */}
          <div className="chat-header" style={{
            padding: '16px 24px', background: '#fff', borderBottom: '1px solid rgba(45,106,79,.12)',
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            {activeContact ? (
              <>
                <div className={`avatar ${avatarColor(contactos.findIndex(c => c.usuarioId === activeContact.usuarioId))}`} style={{
                  width: '40px', height: '40px', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff'
                }}>
                  {initials(activeContact.nombre)}
                </div>
                <div>
                  <div className="chat-name" style={{ fontWeight: 700, color: '#1a3a2a' }}>{activeContact.nombre}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {activeContact.rol || 'Usuario'}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span className="badge badge-green" style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '999px', fontWeight: 600 }}>
                    ● En línea
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="avatar avatar-green" style={{
                  width: '40px', height: '40px', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff'
                }}>
                  --
                </div>
                <div>
                  <div className="chat-name" style={{ fontWeight: 700, color: '#1a3a2a' }}>Selecciona una conversación</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}></div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span className="badge badge-green" style={{ display: 'none' }}>● En línea</span>
                </div>
              </>
            )}
          </div>

          {/* Chat Messages */}
          <div className="chat-messages" style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!activeContact || conversation.length === 0 ? (
              <div className="empty-state" style={{ margin: 'auto', textAlign: 'center' }}>
                <div className="empty-icon" style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💬</div>
                <div style={{ color: '#6b7280' }}>
                  {activeContact
                    ? 'No hay mensajes todavía. ¡Envía un mensaje de saludo!'
                    : 'Selecciona un contacto para iniciar la conversación.'}
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
              placeholder="Escribe un mensaje..."
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              onKeyDown={handleKey}
              disabled={!activeContact}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: '12px',
                border: '1px solid rgba(45,106,79,.2)', fontSize: '0.95rem', outline: 'none'
              }}
            />
            <button
              className="btn btn-primary"
              onClick={sendMessage}
              disabled={!activeContact || !msgText.trim()}
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
        </div>
      </div>
    </div>
  );
}
