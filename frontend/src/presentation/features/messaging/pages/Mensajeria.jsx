import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";
import BuyerShell from "@/presentation/features/order/components/BuyerShell";
import api from "@/infrastructure/http/api";
import { normalizarMensaje as normalizarMensajeBase } from "@/infrastructure/normalizar";
import "@/presentation/styles/mensajeria.css";

export default function Mensajeria() {
  const { t } = useTranslation();
  const { user } = useAuth();


  const [contactos, setContactos] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get("/mensajes/contactos");
        setContactos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loadContactos:", err);
        setContactos([]);
      }
    })();
  }, []);

  /*
   * Normaliza un mensaje del backend (MessageResponse: id, senderId,
   * content, sentAt) al formato que usa la UI (texto, mio, hora).
   */
  const normalizarMensaje = (m) => normalizarMensajeBase(m, user?.id);

  const selectContact = async (contacto) => {
    setSelectedContact(contacto);
    try {
      const data = await api.get(`/mensajes/conversacion/${contacto.id}`);
      setMessages(
        (Array.isArray(data) ? data : []).map(normalizarMensaje),
      );
    } catch (err) {
      console.error("Error loadMessages:", err);
      setMessages([]);
    }
    setTimeout(() => {
      if (chatRef.current)
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 100);
  };

  // TIEMPO REAL: sondea la conversación activa (3.5 s) y los contactos
  // (10 s) para que los mensajes de otros usuarios aparezcan solos.
  useEffect(() => {
    if (!selectedContact) return undefined;
    const conversacionTimer = setInterval(async () => {
      try {
        const data = await api.get(
          `/mensajes/conversacion/${selectedContact.id}`,
        );
        setMessages(
          (Array.isArray(data) ? data : []).map((m) =>
            normalizarMensaje(m),
          ),
        );
      } catch {
        /* silencioso: la siguiente iteración reintenta */
      }
    }, 3500);
    return () => clearInterval(conversacionTimer);
  }, [selectedContact, normalizarMensaje]);

  useEffect(() => {
    const contactosTimer = setInterval(async () => {
      try {
        const data = await api.get("/mensajes/contactos");
        setContactos(Array.isArray(data) ? data : []);
      } catch {
        /* silencioso */
      }
    }, 10000);
    return () => clearInterval(contactosTimer);
  }, []);

  const sendMessage = async () => {
    if (!msgInput.trim() || !selectedContact) return;
    const msg = {
      id: Date.now(),
      texto: msgInput,
      mio: true,
      hora: new Date().toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, msg]);
    const texto = msgInput;
    setMsgInput("");
    try {
      await api.post("/mensajes", {
        destinatarioId: selectedContact.id,
        contenido: texto,
      });

      // Recargar la conversación desde el backend para confirmar que el
      // mensaje quedó persistido y visible para el destinatario.
      const data = await api.get(
        `/mensajes/conversacion/${selectedContact.id}`,
      );
      setMessages(
        (Array.isArray(data) ? data : []).map(normalizarMensaje),
      );
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    }
    setTimeout(() => {
      if (chatRef.current)
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 50);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (user) {
    const role = user.role?.toLowerCase();
    if (role === "comprador") {
      // Buyers stay on the dedicated messaging page.
    } else if (role === "productor") {
      return <Navigate to="/dashboard-productor?section=mensajeria" replace />;
    } else if (role === "admin") {
      return <Navigate to="/admin" replace />;
    }
  }
  return (
    <BuyerShell activeKey="mensajeria">
      <div className="buyer-page-content">
      {/* CHAT LAYOUT */}
      <div className="chat-layout">
        {/* CONTACTS */}
        <div className="chat-contacts" id="contactList">
          {contactos.map((c) => (
            <div
              key={c.id}
              className={`contact-item${selectedContact?.id === c.id ? " active" : ""}`}
              onClick={() => selectContact(c)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 16px",
                cursor: "pointer",
                borderBottom: "1px solid var(--border-light)",
                background:
                  selectedContact?.id === c.id
                    ? "var(--primary-bg)"
                    : "transparent",
              }}
            >
              <div className="avatar avatar-green">{c.iniciales}</div>
              <div>
                <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>
                  {c.nombre}
                </div>
                <div
                  style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                >
                  {t("auth." + c.rol?.toLowerCase(), c.rol)}
                </div>
              </div>
              {c.online && (
                <span
                  className="badge badge-green"
                  style={{ marginLeft: "auto", fontSize: "0.65rem" }}
                >
                  â— {t("mensajeria.online", "En lÃ­nea")}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* WINDOW */}
        <div className="chat-window">
          <div className="chat-header" id="chatHeader">
            <div className="avatar avatar-green" id="chatAvatar">
              {selectedContact?.iniciales || "--"}
            </div>
            <div>
              <div className="chat-name" id="chatName">
                {selectedContact?.nombre ||
                  t("mensajeria.selectContact", "Selecciona un contacto")}
              </div>
              <div
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                id="chatRole"
              >
                {selectedContact?.rol
                  ? t(
                      "auth." + selectedContact.rol?.toLowerCase(),
                      selectedContact.rol,
                    )
                  : ""}
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              {selectedContact?.online && (
                <span className="badge badge-green" id="onlineBadge">
                  â— {t("mensajeria.online", "En lÃ­nea")}
                </span>
              )}
            </div>
          </div>

          <div className="chat-messages" id="chatMessages" ref={chatRef}>
            {!selectedContact ? (
              <div className="empty-state" style={{ margin: "auto" }}>
                <div
                  className="empty-icon"
                  style={{ color: "var(--primary)", marginBottom: "16px" }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="48"
                    height="48"
                    fill="currentColor"
                  >
                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
                  </svg>
                </div>
                <div>
                  {t(
                    "mensajeria.selectContact",
                    "Selecciona un contacto para iniciar la conversaciÃ³n.",
                  )}
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="empty-state" style={{ margin: "auto" }}>
                <div>
                  {t(
                    "mensajeria.emptyMessages",
                    "No hay mensajes aÃºn. Â¡SÃ© el primero en escribir!",
                  )}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`message ${m.mio ? "message-out" : "message-in"}`}
                  style={{
                    display: "flex",
                    justifyContent: m.mio ? "flex-end" : "flex-start",
                    marginBottom: "12px",
                    padding: "0 16px",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "70%",
                      background: m.mio ? "var(--primary)" : "var(--card-bg)",
                      color: m.mio ? "#fff" : "inherit",
                      padding: "10px 14px",
                      borderRadius: m.mio
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                      border: m.mio ? "none" : "1px solid var(--border-light)",
                    }}
                  >
                    <div>{m.texto || m.contenido}</div>
                    <div
                      style={{
                        fontSize: "0.65rem",
                        opacity: 0.7,
                        marginTop: "4px",
                        textAlign: "right",
                      }}
                    >
                      {m.hora}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="chat-input-bar">
            <input
              className="chat-input"
              id="msgInput"
              placeholder={t("mensajeria.typeMessage", "Escribe un mensaje...")}
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
    </BuyerShell>
  );
}
