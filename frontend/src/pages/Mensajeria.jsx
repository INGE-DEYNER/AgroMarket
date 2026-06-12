import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/styles.css';
import '../styles/mensajeria.css';

export default function Mensajeria() {
  const { user } = useAuth();
  const [contactos, setContactos] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const chatRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get('/mensajeria/contactos');
        setContactos(Array.isArray(data) ? data : []);
      } catch {
        setContactos([
          { id: 1, nombre: 'Luis Palacios', rol: 'Productor', iniciales: 'LP', online: true },
          { id: 2, nombre: 'Ana Córdoba', rol: 'Productora', iniciales: 'AC', online: false },
          { id: 3, nombre: 'AgroMarket Soporte', rol: 'Admin', iniciales: 'AM', online: true },
        ]);
      }
    })();
  }, []);

  const selectContact = async (contacto) => {
    setSelectedContact(contacto);
    try {
      const data = await api.get(`/mensajeria/conversacion/${contacto.id}`);
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([
        { id: 1, texto: '¡Hola! ¿Cómo están sus bananos esta semana?', mio: false, hora: '10:30' },
        { id: 2, texto: 'Excelente cosecha, tenemos disponibilidad de 200 kg.', mio: true, hora: '10:32' },
      ]);
    }
    setTimeout(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 100);
  };

  const sendMessage = async () => {
    if (!msgInput.trim() || !selectedContact) return;
    const msg = { id: Date.now(), texto: msgInput, mio: true, hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, msg]);
    const texto = msgInput;
    setMsgInput('');
    try {
      await api.post('/mensajeria/enviar', { destinatarioId: selectedContact.id, contenido: texto });
    } catch {}
    setTimeout(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 50);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="page-wrap">
      {/* NAVBAR */}
      <nav className="navbar">
        <Link className="navbar-brand" to="/dashboard-comprador">
          <span className="logo-icon">🌿</span><span>AgroMarket</span>
        </Link>
        <div className="navbar-links" id="navLinks">
          <Link to="/dashboard-comprador">Mi Panel</Link>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/pedidos">Pedidos</Link>
          <Link to="/mensajeria" className="active">Mensajes</Link>
          <Link to="/envios">Envíos</Link>
        </div>
        <div className="navbar-right" id="navActions">
          <div className="avatar avatar-blue">MT</div>
          <Link to="/login" className="btn btn-secondary btn-sm">Salir</Link>
        </div>
      </nav>

      {/* CHAT LAYOUT */}
      <div className="chat-layout">
        {/* CONTACTS */}
        <div className="chat-contacts" id="contactList">
          {contactos.map((c) => (
            <div
              key={c.id}
              className={`contact-item${selectedContact?.id === c.id ? ' active' : ''}`}
              onClick={() => selectContact(c)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)', background: selectedContact?.id === c.id ? 'var(--primary-bg)' : 'transparent' }}
            >
              <div className="avatar avatar-green">{c.iniciales}</div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{c.nombre}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.rol}</div>
              </div>
              {c.online && <span className="badge badge-green" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>● En línea</span>}
            </div>
          ))}
        </div>

        {/* WINDOW */}
        <div className="chat-window">
          <div className="chat-header" id="chatHeader">
            <div className="avatar avatar-green" id="chatAvatar">
              {selectedContact?.iniciales || '--'}
            </div>
            <div>
              <div className="chat-name" id="chatName">
                {selectedContact?.nombre || 'Selecciona una conversación'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} id="chatRole">
                {selectedContact?.rol || ''}
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              {selectedContact?.online && (
                <span className="badge badge-green" id="onlineBadge">● En línea</span>
              )}
            </div>
          </div>

          <div className="chat-messages" id="chatMessages" ref={chatRef}>
            {!selectedContact ? (
              <div className="empty-state" style={{ margin: 'auto' }}>
                <div className="empty-icon">💬</div>
                <div>Selecciona un contacto para iniciar la conversación.</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="empty-state" style={{ margin: 'auto' }}>
                <div>No hay mensajes aún. ¡Sé el primero en escribir!</div>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`message ${m.mio ? 'message-out' : 'message-in'}`} style={{ display: 'flex', justifyContent: m.mio ? 'flex-end' : 'flex-start', marginBottom: '12px', padding: '0 16px' }}>
                  <div style={{ maxWidth: '70%', background: m.mio ? 'var(--primary)' : 'var(--card-bg)', color: m.mio ? '#fff' : 'inherit', padding: '10px 14px', borderRadius: m.mio ? '16px 16px 4px 16px' : '16px 16px 16px 4px', border: m.mio ? 'none' : '1px solid var(--border-light)' }}>
                    <div>{m.texto || m.contenido}</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>{m.hora}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="chat-input-bar">
            <input
              className="chat-input"
              id="msgInput"
              placeholder="Escribe un mensaje..."
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={!selectedContact}
            />
            <button
              className="btn btn-primary"
              id="sendBtn"
              onClick={sendMessage}
              disabled={!selectedContact}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
