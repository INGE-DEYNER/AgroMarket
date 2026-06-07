// File: frontend/src/components/Toast.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';

const toastListeners = new Set();

export function showToast(message, type = 'info', timeout = 4000) {
  const id = Date.now() + Math.random();
  toastListeners.forEach((fn) => fn({ id, message, type, timeout }));
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, toast.timeout || 4000);
  }, []);

  useEffect(() => {
    toastListeners.add(addToast);
    return () => toastListeners.delete(addToast);
  }, [addToast]);

  const getBackground = (type) => {
    if (type === 'error') return '#c0392b';
    if (type === 'success') return '#2d6a4f';
    if (type === 'warning') return '#b45309';
    return '#333';
  };

  if (toasts.length === 0) return null;

  return (
    <div
      id="am-toast-container"
      style={{
        position: 'fixed',
        right: '16px',
        top: '80px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: getBackground(toast.type),
            color: '#fff',
            fontWeight: 600,
            maxWidth: '320px',
            boxShadow: '0 4px 14px rgba(0,0,0,.18)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
