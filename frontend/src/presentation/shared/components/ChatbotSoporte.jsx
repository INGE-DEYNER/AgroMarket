import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "@/infrastructure/http/api";

const QUICK = [
  ["No puedo iniciar sesión", "No puedo iniciar sesión"],
  ["No recibí el correo", "No recibí el correo de verificación"],
  ["No cambia la divisa", "No cambia la divisa"],
  ["El idioma no cambia", "El idioma no cambia"],
  ["Tengo un problema con el pago", "Tengo un problema con el pago"],
  ["Mi pedido no aparece", "Mi pedido no aparece"],
  ["No puedo agregar al carrito", "No puedo agregar un producto al carrito"],
  ["Quiero vender", "Cómo puedo vender como productor"],
];

export default function ChatbotSoporte() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ id: 1, sender: "bot", text: t("support.botWelcome"), time: now() }]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  function now() { return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date()); }

  const send = async (raw) => {
    const text = String(raw || "").trim();
    if (!text || loading) return;
    setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: "user", text, time: now() }]);
    setInputText(""); setLoading(true);
    try {
      const res = await api.post("/public/chatbot", { mensaje: text });
      const data = res?.data || res;
      setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: "bot", text: data.respuesta || t("support.noAnswer"), time: now() }]);
    } catch (error) {
      console.error("Error en asistente de soporte:", error);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: "bot", text: t("support.connectionError"), time: now() }]);
    } finally { setLoading(false); }
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  return <div className="chatbot-widget-container">
    <style>{`
      .chatbot-widget-container{position:fixed;right:24px;bottom:24px;z-index:9999;font-family:Inter,system-ui,sans-serif}.chatbot-trigger{width:60px;height:60px;border:0;border-radius:50%;background:#2d7a3a;color:#fff;display:grid;place-items:center;cursor:pointer;box-shadow:0 8px 24px rgba(45,122,58,.35)}.chatbot-window{display:none;position:absolute;right:0;bottom:72px;width:min(390px,calc(100vw - 32px));height:560px;max-height:calc(100vh - 110px);background:#fff;border:1px solid #dce5de;border-radius:18px;box-shadow:0 20px 55px rgba(0,0,0,.2);overflow:hidden}.chatbot-window.open{display:flex;flex-direction:column}.chatbot-header{background:#173d23;color:#fff;padding:15px 17px;display:flex;align-items:center;justify-content:space-between}.chatbot-header-info{display:flex;align-items:center;gap:10px}.chatbot-avatar{width:38px;height:38px;border-radius:50%;background:#2d7a3a;display:grid;place-items:center;font-weight:800}.chatbot-title{margin:0;font-size:14px}.chatbot-status{margin:2px 0 0;font-size:11px;opacity:.8}.chatbot-close{border:0;background:transparent;color:#fff;font-size:20px;cursor:pointer}.chatbot-body{flex:1;overflow:auto;padding:16px;background:#f7faf7}.chat-message{display:flex;flex-direction:column;margin-bottom:10px}.chat-message.user{align-items:flex-end}.message-bubble{max-width:82%;padding:10px 12px;border-radius:14px;background:#fff;border:1px solid #e2e8e3;font-size:13px;line-height:1.5}.chat-message.user .message-bubble{background:#dff4e4;border-color:#bfe5c7}.message-time{font-size:9px;color:#829087;margin:3px 5px}.chatbot-quick-actions{padding:9px 12px;background:#fff;border-top:1px solid #e5ebe6}.chips-container{display:flex;gap:7px;overflow:auto}.quick-chip{white-space:nowrap;border:1px solid #cfe0d2;background:#f4faf5;color:#245b31;border-radius:20px;padding:7px 10px;font-size:11px;cursor:pointer}.chatbot-footer{padding:12px;background:#fff;border-top:1px solid #e5ebe6;display:flex;gap:8px}.chatbot-input{min-width:0;flex:1;border:1px solid #cbd8ce;border-radius:22px;padding:10px 13px;outline:none}.chatbot-send{width:40px;height:40px;border:0;border-radius:50%;background:#2d7a3a;color:#fff;cursor:pointer}.chatbot-send:disabled{opacity:.5;cursor:not-allowed}@media(max-width:600px){.chatbot-widget-container{right:12px;bottom:12px}.chatbot-window{right:-2px;bottom:68px;width:calc(100vw - 24px);height:min(560px,calc(100vh - 100px))}.chatbot-trigger{width:54px;height:54px}}
    `}</style>
    <div className={`chatbot-window ${isOpen ? "open" : ""}`}>
      <div className="chatbot-header"><div className="chatbot-header-info"><div className="chatbot-avatar">A</div><div><h4 className="chatbot-title">{t("support.title")}</h4><p className="chatbot-status">{t("support.online")}</p></div></div><button className="chatbot-close" type="button" onClick={() => setIsOpen(false)}>×</button></div>
      <div className="chatbot-body">{messages.map(m => <div key={m.id} className={`chat-message ${m.sender}`}><div className="message-bubble">{m.text}</div><span className="message-time">{m.time}</span></div>)}{loading && <div className="chat-message bot"><div className="message-bubble">{t("support.thinking")}</div></div>}<div ref={endRef}/></div>
      {messages.length === 1 && <div className="chatbot-quick-actions"><div className="chips-container">{QUICK.map(([label,value]) => <button key={label} className="quick-chip" type="button" onClick={() => send(value)}>{t(`support.quick.${label}`, label)}</button>)}</div></div>}
      <div className="chatbot-footer"><input className="chatbot-input" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === "Enter" && send(inputText)} placeholder={t("support.placeholder")} maxLength={500} disabled={loading}/><button className="chatbot-send" type="button" onClick={() => send(inputText)} disabled={loading || !inputText.trim()} aria-label={t("support.send")}>➤</button></div>
    </div>
    <button className="chatbot-trigger" type="button" onClick={() => setIsOpen(v => !v)} aria-label={t("support.openAssistant")}>{isOpen ? "×" : "?"}</button>
  </div>;
}
