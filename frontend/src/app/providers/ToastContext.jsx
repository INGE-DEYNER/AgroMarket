// src/app/providers/ToastContext.jsx
import { useCallback, useRef, useState } from "react";
import ToastContext from "@/app/contexts/ToastContext";
import "@/presentation/styles/microinteractions.css";

const ICONS = {
  success: "✓",
  error: "!",
  warning: "⚠",
  info: "i",
};

const TITLES = {
  success: "Éxito",
  error: "Error",
  warning: "Advertencia",
  info: "Información",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, exiting: true } : toast,
      ),
    );

    const timer = window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      timersRef.current.delete(id);
    }, 220);

    timersRef.current.set(`${id}:remove`, timer);
  }, []);

  const addToast = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = ++counterRef.current;
      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          type,
          title: TITLES[type] || TITLES.info,
          exiting: false,
        },
      ]);

      const timer = window.setTimeout(() => removeToast(id), duration);
      timersRef.current.set(`${id}:auto`, timer);
      return id;
    },
    [removeToast],
  );

  const toast = {
    success: (message, duration) => addToast(message, "success", duration),
    error: (message, duration) => addToast(message, "error", duration),
    warning: (message, duration) => addToast(message, "warning", duration),
    info: (message, duration) => addToast(message, "info", duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div className="am-toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`am-toast am-toast--${toast.type}${toast.exiting ? " is-exiting" : ""}`}
          role={toast.type === "error" ? "alert" : "status"}
        >
          <span aria-hidden="true">{ICONS[toast.type] || ICONS.info}</span>
          <span>
            <span className="am-toast__title">{toast.title}</span>
            <span className="am-toast__message">{toast.message}</span>
          </span>
          <button
            type="button"
            className="am-toast__close"
            onClick={() => onRemove(toast.id)}
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
