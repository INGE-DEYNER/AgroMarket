import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import knowledgeBase from "@/application/support/chatbotKnowledgeBase";
import Icon from "@/presentation/shared/components/Icon";

const QUICK_KEYS = [
  "login",
  "register",
  "products",
  "search_product",
  "cart",
  "how_to_buy",
  "payment",
  "order",
  "shipping",
  "currency",
  "language",
  "profile",
  "update_profile",
  "sell",
  "help",
];

const CHATBOT_CSS = `
  /* ======================================================
     CHATBOT AGROMARKET — Premium Responsive Design
     Soporta tema claro/oscuro via variables.css
     ====================================================== */

  .cb-container {
    position: fixed;
    right: clamp(12px, 3vw, 24px);
    bottom: clamp(12px, 3vh, 24px);
    z-index: 9999;
    font-family: var(--am-font-body, Inter, system-ui, sans-serif);
  }

  /* Botón flotante */
  .cb-trigger {
    width: 56px;
    height: 56px;
    border: none;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--am-green-700, #1a5c2a), var(--am-green-900, #14532d));
    color: #fff;
    display: grid;
    place-items: center;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(26, 92, 42, 0.45), 0 2px 8px rgba(0,0,0,.2);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    flex-shrink: 0;
  }

  .cb-trigger:hover {
    transform: scale(1.08);
    box-shadow: 0 12px 30px rgba(26, 92, 42, 0.55);
  }

  .cb-trigger:active { transform: scale(0.96); }

  /* Ventana */
  .cb-window {
    position: absolute;
    right: 0;
    bottom: 68px;
    width: min(370px, calc(100vw - 24px));
    height: min(540px, calc(100dvh - 96px));
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #d1ddd7);
    border-radius: 18px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(0,0,0,.08);
    overflow: hidden;
    display: none;
    flex-direction: column;
    transform-origin: bottom right;
    animation: cb-open 0.22s cubic-bezier(0.2,0.8,0.2,1);
  }

  .cb-window.open {
    display: flex;
  }

  @keyframes cb-open {
    from { opacity: 0; transform: scale(0.88) translateY(12px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
  }

  /* Header */
  .cb-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 14px 16px;
    background: linear-gradient(135deg, var(--am-green-900, #14532d) 0%, var(--am-green-700, #1a5c2a) 100%);
    color: #fff;
    flex-shrink: 0;
  }

  .cb-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .cb-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    border: 2px solid rgba(255,255,255,0.3);
    display: grid;
    place-items: center;
    font-weight: 800;
    font-size: 14px;
    flex-shrink: 0;
  }

  .cb-header-text { min-width: 0; }

  .cb-title {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cb-status {
    margin: 2px 0 0;
    font-size: 10px;
    opacity: 0.8;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .cb-status::before {
    content: '';
    display: block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #4ade80;
    flex-shrink: 0;
    animation: cb-pulse 2s infinite;
  }

  @keyframes cb-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .cb-close-btn {
    border: none;
    background: rgba(255,255,255,0.12);
    color: #fff;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: background 0.15s ease;
    flex-shrink: 0;
  }

  .cb-close-btn:hover { background: rgba(255,255,255,0.22); }

  /* Cuerpo */
  .cb-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 14px;
    background: var(--am-surface-soft, #e8f5e9);
    display: flex;
    flex-direction: column;
    gap: 8px;
    scroll-behavior: smooth;
  }

  /* Modo oscuro: fondo body */
  html.dark .cb-body, [data-theme="dark"] .cb-body {
    background: var(--am-surface-muted, #202a24);
  }

  /* Burbujas */
  .cb-msg { display: flex; flex-direction: column; }
  .cb-msg.user { align-items: flex-end; }
  .cb-msg.bot  { align-items: flex-start; }

  .cb-bubble {
    max-width: min(82%, 280px);
    padding: 9px 13px;
    border-radius: 14px;
    font-size: 13px;
    line-height: 1.55;
    word-break: break-word;
  }

  .cb-msg.bot .cb-bubble {
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #d1ddd7);
    color: var(--color-text-primary, #14221a);
    border-bottom-left-radius: 4px;
  }

  .cb-msg.user .cb-bubble {
    background: var(--am-green-700, #1a5c2a);
    color: #fff;
    border-bottom-right-radius: 4px;
  }

  .cb-time {
    font-size: 9px;
    color: var(--color-text-muted, #626c66);
    margin: 3px 5px;
  }

  /* Typing indicator */
  .cb-typing span {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--am-green-700, #1a5c2a);
    margin: 0 2px;
    animation: cb-bounce 1s infinite;
  }

  .cb-typing span:nth-child(2) { animation-delay: 0.15s; }
  .cb-typing span:nth-child(3) { animation-delay: 0.3s; }

  @keyframes cb-bounce {
    0%, 100% { transform: translateY(0); opacity: 0.6; }
    50% { transform: translateY(-5px); opacity: 1; }
  }

  /* Quick actions */
  .cb-quick {
    padding: 8px 12px;
    background: var(--color-surface, #fff);
    border-top: 1px solid var(--color-border, #d1ddd7);
    flex-shrink: 0;
  }

  .cb-chips {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 2px;
    scrollbar-width: thin;
  }

  .cb-chip {
    white-space: nowrap;
    border: 1px solid var(--color-border, #d1ddd7);
    background: var(--color-surface-hover, #f3f7f4);
    color: var(--am-green-700, #1a5c2a);
    border-radius: 999px;
    padding: 5px 10px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    flex-shrink: 0;
  }

  .cb-chip:hover {
    background: var(--am-green-100, #e8f5e9);
    border-color: var(--am-green-700, #1a5c2a);
  }

  /* Footer / Input */
  .cb-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: var(--color-surface, #fff);
    border-top: 1px solid var(--color-border, #d1ddd7);
    flex-shrink: 0;
  }

  .cb-input {
    flex: 1;
    min-width: 0;
    border: 1px solid var(--color-border, #d1ddd7);
    border-radius: 22px;
    padding: 9px 14px;
    font-size: 13px;
    background: var(--color-surface, #fff);
    color: var(--color-text-primary, #14221a);
    outline: none;
    transition: border-color 0.15s;
  }

  .cb-input:focus {
    border-color: var(--am-green-700, #1a5c2a);
    box-shadow: 0 0 0 3px rgba(26, 92, 42, 0.1);
  }

  .cb-input::placeholder { color: var(--color-text-muted, #626c66); }

  .cb-send {
    width: 38px;
    height: 38px;
    border: none;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--am-green-700, #1a5c2a), var(--am-green-900, #14532d));
    color: #fff;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    flex-shrink: 0;
  }

  .cb-send:hover:not(:disabled) {
    transform: scale(1.08);
    box-shadow: 0 4px 12px rgba(26, 92, 42, 0.4);
  }

  .cb-send:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Dark mode overrides */
  html.dark .cb-window,
  [data-theme="dark"] .cb-window {
    background: var(--am-surface, #17221a);
    border-color: var(--color-border, #37463c);
  }

  html.dark .cb-msg.bot .cb-bubble,
  [data-theme="dark"] .cb-msg.bot .cb-bubble {
    background: var(--am-surface-muted, #202a24);
    border-color: var(--color-border, #37463c);
    color: var(--color-text-primary, #f3f4f6);
  }

  html.dark .cb-quick,
  html.dark .cb-footer,
  [data-theme="dark"] .cb-quick,
  [data-theme="dark"] .cb-footer {
    background: var(--am-surface, #17221a);
    border-color: var(--color-border, #37463c);
  }

  html.dark .cb-input,
  [data-theme="dark"] .cb-input {
    background: var(--am-surface-muted, #202a24);
    border-color: var(--color-border, #37463c);
    color: var(--color-text-primary, #f3f4f6);
  }

  html.dark .cb-chip,
  [data-theme="dark"] .cb-chip {
    background: var(--am-surface-muted, #202a24);
    border-color: var(--color-border, #37463c);
    color: var(--am-green-300, #9be3a3);
  }

  html.dark .cb-chip:hover,
  [data-theme="dark"] .cb-chip:hover {
    background: var(--am-surface-soft, #1d3022);
  }

  /* Responsive: pantallas muy pequeñas */
  @media (max-width: 400px) {
    .cb-window {
      right: 0;
      bottom: 64px;
      width: calc(100vw - 16px);
      border-radius: 14px;
    }

    .cb-trigger { width: 50px; height: 50px; }
  }
`;

export default function ChatbotSoporte() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: t("support.botWelcome"), time: now() },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  function now() {
    return new Intl.DateTimeFormat(
      String(i18n.resolvedLanguage || i18n.language || "es"),
      { hour: "2-digit", minute: "2-digit" },
    ).format(new Date());
  }

  function answerLocally(raw) {
    const text = String(raw || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const lang = String(i18n.resolvedLanguage || i18n.language || "es")
      .split("-")[0]
      .toLowerCase();
    const kb = knowledgeBase[lang] || knowledgeBase.es;
    for (const entry of kb) {
      if (entry.keywords.some((k) => text.includes(k))) return entry.answer;
    }
    return t("support.noAnswer");
  }

  useEffect(() => {
    const onLang = () => {
      setMessages((prev) => {
        if (prev.length !== 1 || prev[0].sender !== "bot") return prev;
        return [{ ...prev[0], text: i18n.t("support.botWelcome") }];
      });
    };
    i18n.on("languageChanged", onLang);
    return () => { i18n.off("languageChanged", onLang); };
  }, [i18n]);

  const send = async (raw) => {
    const text = String(raw || "").trim();
    if (!text || loading) return;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), sender: "user", text, time: now() },
    ]);
    setInputText("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));
    const answer = answerLocally(text);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), sender: "bot", text: answer, time: now() },
    ]);
    setLoading(false);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="cb-container">
      <style>{CHATBOT_CSS}</style>

      {/* Ventana del chat */}
      <div className={`cb-window ${isOpen ? "open" : ""}`}>

        {/* Header */}
        <div className="cb-header">
          <div className="cb-header-left">
            <div className="cb-avatar">A</div>
            <div className="cb-header-text">
              <h4 className="cb-title">{t("support.title")}</h4>
              <p className="cb-status">{t("support.online")}</p>
            </div>
          </div>
          <button
            className="cb-close-btn"
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar chat"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Mensajes */}
        <div className="cb-body">
          {messages.map((m) => (
            <div key={m.id} className={`cb-msg ${m.sender}`}>
              <div className="cb-bubble">{m.text}</div>
              <span className="cb-time">{m.time}</span>
            </div>
          ))}
          {loading && (
            <div className="cb-msg bot">
              <div className="cb-bubble">
                <div className="cb-typing">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick chips (solo primer mensaje) */}
        {messages.length === 1 && (
          <div className="cb-quick">
            <div className="cb-chips">
              {QUICK_KEYS.map((key) => (
                <button
                  key={key}
                  className="cb-chip"
                  type="button"
                  onClick={() => send(t(`support.quickQuestions.${key}`, key))}
                >
                  {t(`support.quick.${key}`, t(`support.quickQuestions.${key}`, key))}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="cb-footer">
          <input
            className="cb-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(inputText)}
            placeholder={t("support.placeholder")}
            maxLength={500}
            disabled={loading}
          />
          <button
            className="cb-send"
            type="button"
            onClick={() => send(inputText)}
            disabled={loading || !inputText.trim()}
            aria-label={t("support.send")}
          >
            <Icon name="send" size={16} />
          </button>
        </div>
      </div>

      {/* Botón flotante */}
      <button
        className="cb-trigger"
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={t("support.openAssistant")}
      >
        {isOpen
          ? <Icon name="x" size={22} />
          : <Icon name="messageCircle" size={22} />
        }
      </button>
    </div>
  );
}


