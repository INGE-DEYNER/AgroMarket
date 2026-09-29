/*
 * SeccionMensajeria — sección del panel.
 *
 * Movimiento puro del JSX que estaba dentro del archivo del panel. Lo
 * único que cambia: el estado llega por contexto en vez de por el ámbito del
 * padre, y el contenedor ya no lleva la condición de activeSection porque
 * con el Outlet solo se monta la sección activa.
 */
import { useCompradorData } from "./CompradorContexto.js";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";
import { formatearHora } from "@/infrastructure/normalizar";

export default function SeccionMensajeria() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { chatRef, contactos, messages, msgInput, selectContact, selectedContact, sendMessage, setMsgInput } = useCompradorData();

  return (
<div className="section" id="sec-mensajeria">
          <div
            className="chat-layout"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              background: "var(--card-bg)",
              border: "1px solid var(--border-light)",
              borderRadius: "12px",
              overflow: "hidden",
              height: "600px",
            }}
          >
            {/* CONTACTS */}
            <div
              className="chat-contacts"
              style={{
                borderRight: "1px solid var(--border-light)",
                overflowY: "auto",
              }}
            >
              {contactos.length === 0 ? (
                <div
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  No tienes contactos activos.
                </div>
              ) : (
                contactos.map((c) => (
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
                    <div className="avatar avatar-blue">
                      {c.nombre?.charAt(0).toUpperCase() || "C"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>
                        {c.nombre}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {t("auth." + c.rol?.toLowerCase(), c.rol)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* WINDOW */}
            <div
              className="chat-window"
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div
                className="chat-header"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--border-light)",
                }}
              >
                <div className="avatar avatar-blue">
                  {selectedContact?.nombre?.charAt(0).toUpperCase() || "--"}
                </div>
                <div>
                  <div className="chat-name" style={{ fontWeight: "700" }}>
                    {selectedContact?.nombre || "Selecciona un contacto"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    {selectedContact?.rol || ""}
                  </div>
                </div>
              </div>

              <div
                className="chat-messages"
                ref={chatRef}
                style={{
                  flex: 1,
                  padding: "20px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {!selectedContact ? (
                  <div
                    style={{
                      margin: "auto",
                      textAlign: "center",
                      color: "var(--text-muted)",
                    }}
                  >
                    <div style={{ fontSize: "2.5rem" }}></div>
                    <div>
                      Selecciona un contacto para iniciar la conversación.
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ margin: "auto", color: "var(--text-muted)" }}>
                    No hay mensajes aún. ¡Sé el primero en escribir!
                  </div>
                ) : (
                  messages.map((m) => {
                    const esMio = m.mio || m.remitenteId === user?.id;
                    return (
                      <div
                        key={m.id}
                        style={{
                          display: "flex",
                          justifyContent: esMio ? "flex-end" : "flex-start",
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "70%",
                            background: esMio
                              ? "var(--primary)"
                              : "var(--card-bg)",
                            color: esMio ? "#fff" : "inherit",
                            padding: "10px 14px",
                            borderRadius: esMio
                              ? "16px 16px 4px 16px"
                              : "16px 16px 16px 4px",
                            border: esMio
                              ? "none"
                              : "1px solid var(--border-light)",
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
                            {m.hora ||
                              formatearHora(m.fechaEnvio ?? m.sentAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div
                className="chat-input-bar"
                style={{
                  padding: "16px",
                  borderTop: "1px solid var(--border-light)",
                  display: "flex",
                  gap: "12px",
                }}
              >
                <input
                  className="chat-input"
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-light)",
                  }}
                  placeholder={t("messaging.typeMessage", "Escribe un mensaje...")}
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                  disabled={!selectedContact}
                />
                <button
                  className="btn btn-primary"
                  onClick={sendMessage}
                  disabled={!selectedContact}
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
  );
}
