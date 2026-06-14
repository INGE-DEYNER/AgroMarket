import { useState, useRef, useEffect } from 'react';

export default function ChatbotSoporte() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '¡Hola! Soy el asistente virtual de AgroMarket. 🌾 ¿En qué puedo ayudarte hoy?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const FAQ_KEYWORDS = [
    {
      keywords: ['descuento', 'cupon', 'cupón', 'promocion', 'promoción', 'codigo', 'código'],
      answer: '¡Claro! En AgroMarket ofrecemos cupones de descuento especiales para nuestros compradores. Puedes ver tus cupones activos en la sección de "Mis Cupones" en tu Perfil y aplicarlos en el carrito.'
    },
    {
      keywords: ['envio', 'envío', 'despacho', 'entrega', 'transporte', 'llegar'],
      answer: 'Los envíos se realizan directamente desde Urabá por los productores asociados. Puedes realizar el seguimiento de tu despacho en tiempo real en la pestaña "Despachos" de tu panel.'
    },
    {
      keywords: ['pago', 'tarjeta', 'fideicomiso', 'escrow', 'seguro', 'comprar', 'precio', 'divisa', 'moneda'],
      answer: 'Soportamos pagos seguros en línea con tarjetas de crédito/débito. Usamos un sistema de Fideicomiso (Escrow) que retiene el dinero de forma segura hasta que confirmes la entrega. También puedes cambiar tu divisa preferida (COP, USD, EUR) en Perfil.'
    },
    {
      keywords: ['productor', 'vender', 'agricultor', 'cosecha', 'finca', 'nit', 'cuenta', 'aprobar', 'aprobacion'],
      answer: '¡Excelente que quieras vender! Regístrate como Productor, completa tu perfil con tu ubicación/vereda y cuenta bancaria. Un administrador revisará tu solicitud y, una vez aprobada, podrás publicar tus productos.'
    },
    {
      keywords: ['soporte', 'ayuda', 'contacto', 'reclamar', 'problema', 'error', 'correo'],
      answer: 'Estamos aquí para ayudarte en todo momento. Puedes comunicarte por el chat interno en "Mensajería" directamente con el productor del producto, o escribirnos a soporte@agromarket.com.'
    }
  ];

  const handleSend = (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Bot response simulation with slight delay
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let matchedAnswer = '';

      for (const faq of FAQ_KEYWORDS) {
        if (faq.keywords.some(kw => lowerText.includes(kw))) {
          matchedAnswer = faq.answer;
          break;
        }
      }

      if (!matchedAnswer) {
        matchedAnswer = 'Entiendo. Como asistente virtual puedo ayudarte con temas sobre Descuentos, Envíos, Pagos o cómo ser Productor. Prueba a pulsar alguno de los botones rápidos o reformular tu duda.';
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: matchedAnswer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  const handleQuickAction = (topic, label) => {
    handleSend(`Quiero saber sobre ${label}`);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="chatbot-widget-container">
      {/* CSS STYLES FOR PREMIUM FLOATING INTERFACE */}
      <style>{`
        .chatbot-widget-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        .chatbot-trigger {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #385723 0%, #2d451c 100%);
          box-shadow: 0 8px 24px rgba(56, 87, 35, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          font-size: 1.8rem;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }
        .chatbot-trigger:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 12px 28px rgba(56, 87, 35, 0.5);
        }
        .chatbot-trigger .pulse {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 50%;
          border: 2px solid #4caf50;
          animation: chat-pulse 2s infinite;
          opacity: 0;
          pointer-events: none;
        }
        @keyframes chat-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .chatbot-window {
          position: absolute;
          bottom: 76px;
          right: 0;
          width: 380px;
          max-width: calc(100vw - 48px);
          height: 520px;
          max-height: calc(100vh - 120px);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(56, 87, 35, 0.15);
          border-radius: 20px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.075, 0.82, 0.165, 1);
          transform-origin: bottom right;
          opacity: 0;
          transform: scale(0.8) translateY(20px);
          pointer-events: none;
        }
        .chatbot-window.open {
          opacity: 1;
          transform: scale(1) translateY(0);
          pointer-events: auto;
        }
        .chatbot-header {
          background: linear-gradient(135deg, #385723 0%, #2d451c 100%);
          color: white;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .chatbot-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .chatbot-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .chatbot-title {
          font-weight: 700;
          font-size: 0.95rem;
          margin: 0;
          letter-spacing: 0.2px;
        }
        .chatbot-status {
          font-size: 0.75rem;
          color: #a3e635;
          margin: 2px 0 0 0;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .chatbot-status::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          background: #a3e635;
          border-radius: 50%;
          box-shadow: 0 0 8px #a3e635;
        }
        .chatbot-close {
          background: transparent;
          border: none;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .chatbot-close:hover {
          opacity: 1;
        }
        .chatbot-body {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .chat-message {
          display: flex;
          flex-direction: column;
          max-width: 80%;
          animation: message-fade 0.3s ease-out;
        }
        @keyframes message-fade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chat-message.bot {
          align-self: flex-start;
        }
        .chat-message.user {
          align-self: flex-end;
        }
        .message-bubble {
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 0.88rem;
          line-height: 1.4;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        }
        .chat-message.bot .message-bubble {
          background: white;
          color: #334155;
          border-bottom-left-radius: 4px;
          border: 1px solid #e2e8f0;
        }
        .chat-message.user .message-bubble {
          background: #385723;
          color: white;
          border-bottom-right-radius: 4px;
        }
        .message-time {
          font-size: 0.7rem;
          color: #94a3b8;
          margin-top: 4px;
          padding: 0 4px;
        }
        .chat-message.user .message-time {
          align-self: flex-end;
        }
        .chatbot-quick-actions {
          padding: 12px 20px;
          background: white;
          border-top: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .quick-actions-title {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }
        .chips-container {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .chips-container::-webkit-scrollbar {
          height: 4px;
        }
        .chips-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        .quick-chip {
          white-space: nowrap;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #475569;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .quick-chip:hover {
          background: #385723;
          color: white;
          border-color: #385723;
          transform: translateY(-1px);
        }
        .chatbot-footer {
          padding: 16px 20px;
          background: white;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .chatbot-input {
          flex: 1;
          border: 1px solid #cbd5e1;
          border-radius: 24px;
          padding: 10px 16px;
          font-size: 0.88rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .chatbot-input:focus {
          border-color: #385723;
        }
        .chatbot-send {
          background: #385723;
          color: white;
          border: none;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .chatbot-send:hover {
          background: #2d451c;
          transform: scale(1.05);
        }
        .chatbot-send:active {
          transform: scale(0.95);
        }
      `}</style>

      {/* CHAT WINDOW */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">🌾</div>
            <div>
              <h4 className="chatbot-title">Soporte AgroMarket</h4>
              <p className="chatbot-status">En línea</p>
            </div>
          </div>
          <button className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close Chat">
            ✕
          </button>
        </div>

        <div className="chatbot-body">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              <div className="message-bubble">{msg.text}</div>
              <span className="message-time">{msg.time}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* QUICK ACTION CHIPS */}
        <div className="chatbot-quick-actions">
          <p className="quick-actions-title">Preguntas Frecuentes</p>
          <div className="chips-container">
            <button className="quick-chip" onClick={() => handleQuickAction('descuento', 'Descuentos')}>💸 Descuentos</button>
            <button className="quick-chip" onClick={() => handleQuickAction('envio', 'Envíos')}>🚚 Envíos</button>
            <button className="quick-chip" onClick={() => handleQuickAction('pago', 'Pagos')}>💳 Métodos de Pago</button>
            <button className="quick-chip" onClick={() => handleQuickAction('productor', 'Vender')}>👨‍🌾 Ser Productor</button>
          </div>
        </div>

        {/* INPUT FOOTER */}
        <div className="chatbot-footer">
          <input
            type="text"
            className="chatbot-input"
            placeholder="Escribe un mensaje..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend(inputText);
            }}
          />
          <button className="chatbot-send" onClick={() => handleSend(inputText)} aria-label="Send Message">
            ➤
          </button>
        </div>
      </div>

      {/* FLOATING TRIGGER BUTTON */}
      <div className="chatbot-trigger" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Support Chatbot">
        <span style={{ display: 'inline-block', transition: 'transform 0.3s', transform: isOpen ? 'rotate(90deg)' : 'none' }}>
          {isOpen ? '💬' : '💬'}
        </span>
        <div className="pulse"></div>
      </div>
    </div>
  );
}
