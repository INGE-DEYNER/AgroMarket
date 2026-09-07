import { useState, useRef, useEffect } from "react";
import api from "@/infrastructure/http/api";
import { useAuth } from "@/app/hooks/useAuth";

export default function ChatbotSoporte() {
  const { user } = useAuth();
  const esAdmin =
    user?.rol === "ADMINISTRADOR" ||
    user?.rol?.toUpperCase() === "ADMINISTRADOR";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "¡Hola! Soy el asistente virtual de AgroMarket. ¿En qué puedo ayudarte hoy?",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const FAQ_KEYWORDS = [
    {
      label: "Descuentos",
      value: "Quiero saber sobre descuentos y promociones",
    },
    { label: "Envíos", value: "Cómo funcionan los envíos y despachos" },
    { label: "Pagos", value: "Qué métodos de pago aceptan" },
    {
      label: "Vender",
      value: "Cómo puedo registrarme para vender mis productos como productor",
    },
  ];

  const [showKeyInput, setShowKeyInput] = useState(false);
  const [userApiKey, setUserApiKey] = useState(
    localStorage.getItem("user_gemini_key") || "",
  );

  const getLocalFallback = (text) => {
    const lower = text ? text.toLowerCase() : "";

    if (
      lower.includes("pedido") ||
      lower.includes("compra") ||
      lower.includes("orden")
    ) {
      return "Para consultar tu pedido, ve a 'Mis Pedidos' en tu dashboard. Si tienes el número de pedido, nuestro equipo de soporte puede ayudarte en soporte@agro-market.app";
    }

    if (
      lower.includes("pago") ||
      lower.includes("tarjeta") ||
      lower.includes("pse") ||
      lower.includes("banco") ||
      lower.includes("comprar")
    ) {
      return "Aceptamos pagos simulados por PSE y tarjeta en nuestra pasarela de pagos. Si tuviste un inconveniente al pagar, escríbenos a soporte@agro-market.app";
    }

    if (
      lower.includes("producto") ||
      lower.includes("fruta") ||
      lower.includes("banano") ||
      lower.includes("aguacate") ||
      lower.includes("maracuyá") ||
      lower.includes("piña") ||
      lower.includes("mango")
    ) {
      return "Tenemos frutas tropicales frescas directo de Urabá: banano, maracuyá, aguacate, piña y más. Visita nuestro catálogo para ver disponibilidad y precios.";
    }

    if (
      lower.includes("envio") ||
      lower.includes("envío") ||
      lower.includes("entrega") ||
      lower.includes("distancia") ||
      lower.includes("seguimiento") ||
      lower.includes("ruta") ||
      lower.includes("trazabilidad")
    ) {
      return "Los envíos se calculan automáticamente según la distancia desde Chigorodó, Antioquia. Recibirás actualizaciones detalladas del estado en tu dashboard de envíos.";
    }

    if (
      lower.includes("descuento") ||
      lower.includes("oferta") ||
      lower.includes("promo") ||
      lower.includes("precio")
    ) {
      return "Contamos con una sección de ofertas y promociones especiales en nuestro catálogo de frutas tropicales. ¡Busca los productos marcados con la etiqueta % PROMO!";
    }

    if (
      lower.includes("problema") ||
      lower.includes("peoble") ||
      lower.includes("peobla") ||
      lower.includes("falla") ||
      lower.includes("error") ||
      lower.includes("fallo") ||
      lower.includes("soporte") ||
      lower.includes("ayuda")
    ) {
      return "Lamento que tengas inconvenientes. Para soporte técnico, reclamos o ayuda con tu cuenta, escríbenos directamente a soporte@agro-market.app y nuestro equipo te asistirá en menos de 24 horas.";
    }

    if (
      lower.includes("que haces") ||
      lower.includes("quien eres") ||
      lower.includes("ia") ||
      lower.includes("asistente") ||
      lower.includes("haces")
    ) {
      return "Soy el asistente inteligente de AgroMarket. Puedo orientarte sobre cómo comprar productos frescos, cómo realizar el pago por PSE/tarjeta, realizar el seguimiento de tus envíos y solucionar dudas generales.";
    }

    return "Hola, soy el asistente de AgroMarket. ¿En qué puedo ayudarte hoy? Puedo ayudarte con pedidos, productos, pagos o información general.";
  };

  const handleSend = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = {
      id: crypto.randomUUID(),
      sender: "user",
      text: text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), 10000),
    );

    try {
      const requestPromise = api.post("/public/chatbot", { mensaje: text });
      const res = await Promise.race([requestPromise, timeoutPromise]);
      const data = res.data || res;
      let answer =
        data.respuesta || "Lo siento, no pude procesar tu solicitud.";

      // Safeguard: Never render raw JSON as text
      if (typeof answer === "object") {
        answer = JSON.stringify(answer);
      }
      if (
        typeof answer === "string" &&
        (answer.trim().startsWith("{") || answer.trim().startsWith("["))
      ) {
        try {
          const parsed = JSON.parse(answer);
          answer =
            parsed.respuesta ||
            parsed.response ||
            parsed.text ||
            parsed.message ||
            Object.values(parsed)[0];
          if (typeof answer === "object") {
            answer = JSON.stringify(answer);
          }
        } catch {
          // ignore: answer wasn't valid JSON, keep it as plain text
        }
      }

      const botMsg = {
        id: crypto.randomUUID(),
        sender: "bot",
        text: answer,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMsg = {
        id: crypto.randomUUID(),
        sender: "bot",
        text: getLocalFallback(text),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (topic, value) => {
    handleSend(value);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

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
          max-width: calc(100% - 48px);
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
          font-weight: bold;
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
          white-space: pre-wrap;
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
        .chatbot-typing {
          display: flex;
          gap: 4px;
          align-items: center;
          justify-content: center;
          padding: 8px 16px;
        }
        .chatbot-typing span {
          width: 6px;
          height: 6px;
          background: #94a3b8;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out both;
        }
        .chatbot-typing span:nth-child(1) { animation-delay: -0.32s; }
        .chatbot-typing span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
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
        @media (max-width: 768px) {
          .chatbot-widget-container {
            bottom: 80px;
            right: 16px;
          }
          .chatbot-window {
            bottom: 70px;
            right: 0;
            width: calc(100% - 32px);
            height: 400px;
          }
        }
      `}</style>

      {/* CHAT WINDOW */}
      <div className={`chatbot-window ${isOpen ? "open" : ""}`}>
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">A</div>
            <div>
              <h4 className="chatbot-title">Soporte AgroMarket</h4>
              <p className="chatbot-status">En línea</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {esAdmin && (
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "1rem",
                  padding: "4px",
                  opacity: 0.8,
                  display: "flex",
                  alignItems: "center",
                }}
                title="Configurar API Key de Gemini"
              >
                ⚙️
              </button>
            )}
            <button
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close Chat"
            >
              ✕
            </button>
          </div>
        </div>

        {showKeyInput && (
          <div
            style={{
              background: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              padding: "10px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <label
              style={{
                fontSize: "0.72rem",
                fontWeight: "600",
                color: "#475569",
              }}
            >
              API Key Personal de Gemini:
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Pega tu API Key de Google..."
                value={userApiKey}
                onChange={(e) => {
                  setUserApiKey(e.target.value);
                  localStorage.setItem(
                    "user_gemini_key",
                    e.target.value.trim(),
                  );
                }}
                style={{
                  flex: 1,
                  padding: "6px 10px",
                  fontSize: "0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  outline: "none",
                }}
              />
              {userApiKey && (
                <button
                  onClick={() => {
                    setUserApiKey("");
                    localStorage.removeItem("user_gemini_key");
                  }}
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "0.7rem",
                    cursor: "pointer",
                  }}
                >
                  Limpiar
                </button>
              )}
            </div>
            <span style={{ fontSize: "0.62rem", color: "#64748b" }}>
              Consigue una key gratis en{" "}
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "underline", color: "var(--primary)" }}
              >
                Google AI Studio
              </a>
              .
            </span>
          </div>
        )}

        <div className="chatbot-body">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              <div className="message-bubble">{msg.text}</div>
              <span className="message-time">{msg.time}</span>
            </div>
          ))}
          {loading && (
            <div className="chat-message bot">
              <div className="message-bubble chatbot-typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* QUICK ACTION CHIPS */}
        {messages.length <= 1 && (
          <div className="chatbot-quick-actions">
            <div className="chips-container">
              {FAQ_KEYWORDS.map((faq, i) => (
                <button
                  key={i}
                  className="quick-chip"
                  onClick={() => handleQuickAction(faq.label, faq.value)}
                >
                  {faq.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="chatbot-footer">
          <input
            type="text"
            className="chatbot-input"
            placeholder="Pregunta sobre pedidos, productos, envíos..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend(inputText);
            }}
            disabled={loading}
            maxLength={500}
          />
          <button
            className="chatbot-send"
            onClick={() => handleSend(inputText)}
            aria-label="Send Message"
            disabled={loading || !inputText.trim()}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* FLOATING TRIGGER BUTTON */}
      <div
        className="chatbot-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Support Chatbot"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        )}
        <div className="pulse"></div>
      </div>
    </div>
  );
}


