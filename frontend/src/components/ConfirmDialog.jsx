// src/components/ConfirmDialog.jsx
import { useEffect, useRef } from 'react';

/**
 * Animated confirm dialog — replaces native window.confirm().
 * Props:
 *   open: boolean
 *   title: string
 *   message: string
 *   confirmLabel?: string (default "Confirmar")
 *   cancelLabel?: string (default "Cancelar")
 *   onConfirm: () => void
 *   onCancel: () => void
 *   variant?: 'danger' | 'warning' | 'default'
 */
export default function ConfirmDialog({
  open,
  title = '¿Estás seguro?',
  message = '',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'default',
}) {
  const cancelBtnRef = useRef(null);

  // Focus cancel by default (safer UX)
  useEffect(() => {
    if (open) {
      setTimeout(() => cancelBtnRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && open) onCancel?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmBg = variant === 'danger'  ? '#dc2626'
                  : variant === 'warning' ? '#d97706'
                  : '#2d6a4f';

  const iconContent = variant === 'danger' ? (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="#dc2626">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>
  ) : variant === 'warning' ? (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="#d97706">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="#2d6a4f">
      <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/>
    </svg>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease',
        }}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-msg"
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9001,
          background: '#fff',
          borderRadius: '16px',
          padding: '32px',
          width: '100%', maxWidth: '420px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          animation: 'dialogScale 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Icon */}
        <div style={{ marginBottom: '16px' }}>{iconContent}</div>

        <h2 id="confirm-title" style={{
          fontSize: '18px', fontWeight: '700',
          color: '#1a1a2e', marginBottom: '10px',
          fontFamily: "'Outfit', sans-serif",
        }}>
          {title}
        </h2>

        {message && (
          <p id="confirm-msg" style={{ color: '#4a5568', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
            {message}
          </p>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            style={{
              padding: '10px 20px', borderRadius: '8px',
              border: '1.5px solid #e5e7eb', background: '#fff',
              color: '#374151', fontWeight: '600', fontSize: '14px',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#9ca3af'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px', borderRadius: '8px',
              background: confirmBg, color: '#fff',
              border: 'none', fontWeight: '600', fontSize: '14px',
              cursor: 'pointer', transition: 'all 0.2s ease',
              boxShadow: `0 4px 14px ${confirmBg}44`,
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dialogScale {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.88); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}
