// File: frontend/src/components/RecuperarContrasena.jsx
import React, { useState, useEffect } from 'react';
import { useSecureParams } from '../hooks/useSecureParams.js';
import api from '../utils/api.js';

export default function RecuperarContrasena() {
  const { getParam } = useSecureParams();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [resultKind, setResultKind] = useState('info');
  const [loading, setLoading] = useState(false);

  const search = window.location.search;

  useEffect(() => {
    const prefillEmail = getParam('correo') || '';
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [search, getParam]);

  const isValidEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const validateEmail = (show = true) => {
    if (!email.trim()) {
      if (show) setEmailError('El correo es requerido.');
      return false;
    }
    if (!isValidEmail(email.trim())) {
      if (show) setEmailError('Ingresa un correo válido.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResultMessage('');

    if (!validateEmail(true)) return;

    setLoading(true);
    try {
      await api.requestPasswordReset(email.trim());
      setResultMessage("Si el correo existe, recibirás un enlace de recuperación en unos minutos.");
      setResultKind('info');
    } catch (error) {
      const msg = error?.mensaje || error?.message || "No se pudo enviar el enlace.";
      setResultMessage(msg);
      setResultKind('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="left-panel">
        <a href="login.html" className="brand">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24">
              <path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z" />
            </svg>
          </div>
          <div>
            <div className="brand-name">AgroMarket</div>
            <div className="brand-sub">Plataforma de comercio agrícola</div>
          </div>
        </a>

        <div style={{ margin: "auto 0", maxWidth: "420px", width: "100%" }}>
          <h1 className="page-title">Recupera tu acceso</h1>
          <p className="page-sub">Te enviaremos un enlace seguro al correo asociado a tu cuenta.</p>

          {resultMessage && (
            <div className={`result-box visible ${resultKind === 'error' ? 'error' : ''}`}>
              {resultMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Correo electrónico</label>
              <input
                className={`form-input ${emailError ? 'error' : ''}`}
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => validateEmail(true)}
                autoComplete="email"
              />
              {emailError && <span className="form-error visible">{emailError}</span>}
            </div>

            <button className="btn-submit" disabled={loading} type="submit">
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </form>

          <div className="divider"></div>

          <div className="form-footer">
            ¿Recordaste tu contraseña? <a href="login.html">Volver al inicio de sesión</a>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200"
          alt="Frutas frescas"
          className="bg-img"
        />
        <div className="right-overlay">
          <div className="right-badge">🌿 AgroMarket seguro</div>
          <h2 className="right-title">Restablece tu contraseña sin perder acceso a tus pedidos.</h2>
          <p className="right-sub">
            El enlace caduca en 1 hora y solo funciona una vez para proteger tu cuenta.
          </p>

          <div className="hero-list">
            <div className="hero-item">
              <span>1</span>
              <div>
                <strong>Correo verificado</strong><br />Usa el correo con el que te registraste.
              </div>
            </div>
            <div className="hero-item">
              <span>2</span>
              <div>
                <strong>Enlace seguro</strong><br />Recibe un acceso temporal para definir tu nueva clave.
              </div>
            </div>
            <div className="hero-item">
              <span>3</span>
              <div>
                <strong>Protección activa</strong><br />Los enlaces expiran automáticamente para tu seguridad.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
