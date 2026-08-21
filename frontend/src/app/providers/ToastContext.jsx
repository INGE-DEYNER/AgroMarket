// src/context/ToastContext.jsx
import { useState, useCallback, useRef } from 'react';

import ToastContext from "@/app/contexts/ToastContext";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++counterRef.current;
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);

    setTimeout(() => {
      // Mark as exiting to trigger slide-out animation
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      // Remove after animation completes
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error:   (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info:    (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// ── Inline container to avoid circular import ──────────────────────────
const ICONS = {
  success: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>
  ),
};

const COLORS = {
  success: { bg: '#f0fdf4', border: '#bbf7d0', color: '#166534', icon: '#16a34a' },
  error:   { bg: '#fef2f2', border: '#fecaca', color: '#991b1b', icon: '#dc2626' },
  warning: { bg: '#fffbeb', border: '#fde68a', color: '#92400e', icon: '#d97706' },
  info:    { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af', icon: '#2563eb' },
};

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;
  return (
    <>
      <div style={{
        position: 'fixed', top: '24px', right: '24px',
        zIndex: 9998, display: 'flex', flexDirection: 'column', gap: '10px',
        maxWidth: '360px', width: '100%',
        pointerEvents: 'none',
      }}>
        {toasts.map(toast => {
          const c = COLORS[toast.type] || COLORS.info;
          return (
            <div
              key={toast.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '14px 16px',
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                animation: toast.exiting
                  ? 'toastSlideOut 0.3s ease forwards'
                  : 'toastSlideIn 0.3s ease',
                pointerEvents: 'all',
                color: c.color,
              }}
            >
              <span style={{ color: c.icon, flexShrink: 0, marginTop: '1px' }}>
                {ICONS[toast.type]}
              </span>
              <span style={{ flex: 1, fontSize: '14px', lineHeight: '1.5', fontWeight: '500' }}>
                {toast.message}
              </span>
              <button
                onClick={() => onRemove(toast.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: c.color, opacity: 0.6, padding: '2px',
                  flexShrink: 0, lineHeight: 1,
                }}
                aria-label="Cerrar notificación"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes toastSlideOut {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(100%); }
        }
      `}</style>
    </>
  );
}


