import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/styles.css';
import '../styles/mensajeria.css';

export default function Mensajeria() {
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
        await openContact(data[0].usuarioId);
      }
    } catch (error) {
      console.error("Error al cargar contactos: ", error);
    } finally {
      setLoading(false);
    }
  };

  const openContact = async (userId) => {
    const contact = contactos.find((c) => String(c.usuarioId) === String(userId));
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
    <div className="page-wrap">
      {/* NAVBAR */}
      <nav className="navbar">
        <a className="navbar-brand" href="/dashboard-comprador">
          <span className="logo-icon">🌿</span><span>AgroMarket</span>
        </a>
        <div className="navbar-links" id="navLinks">
          <Link to="/dashboard-comprador">Mi Panel</Link>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/pedidos">Pedidos</Link>
          <Link to="/mensajeria" className="active">Mensajes</Link>
          <Link to="/envios">Envíos</Link>
        </div>
        <div className="navbar-right" id="navActions">
          <div className="avatar avatar-blue">MT</div>
          <a href="/login" className="btn btn-secondary btn-sm">Salir</a>
        </div>
      </nav>

      {/* CHAT LAYOUT */}
      <div className="chat-layout">
        {/* CONTACTS */}
        <div className="chat-contacts" id="contactList">
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
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.2s' }}
              >
                <div className={avatarColor(index)} style={{
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
        <div className="chat-window">
          {/* Chat Header */}
          <div className="chat-header" id="chatHeader">
            {activeContact ? (
              <div className="avatar avatar-green" style={{
                width: '40px', height: '40px', borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff'
              }}>
                {initials(activeContact.nombre)}
              </div>
            ) : (
              <div className="avatar avatar-green" id="chatAvatar" style={{
                width: '40px', height: '40px', borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff'
              }}>
                --
              </div>
            )}
            <div>
              <div className="chat-name" id="chatName">
                {activeContact ? activeContact.nombre : 'Selecciona una conversación'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }} id="chatRole">
                {activeContact ? (activeContact.rol || 'Usuario') : ''}
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span
                className="badge badge-green"
                id="onlineBadge"
                style={activeContact ? { display: 'inline', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '999px', fontWeight: 600, color: '#065f46', background: '#d1fae5' } : { display: 'none' }}
              >
                ● En línea
              </span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages" id="chatMessages">
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
            {conversation.map((mensaje) => {
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
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="chat-input-bar">
            <input
              className="chat-input"
              id="msgInput"
              placeholder="Escribe un mensaje..."
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              onKeyDown={handleKey}
              disabled={!activeContact}
            />
            <button
              className="btn btn-primary"
              id="sendBtn"
              onClick={sendMessage}
              disabled={!activeContact || !msgText.trim()}
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
      {/* /chat-layout */}
    </div>
    {/* /page-wrap */}
  );
}
