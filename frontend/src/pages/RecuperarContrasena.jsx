import '../styles/recuperar-contrasena.css';
import React, { useState, useEffect } from 'react';
import { useSecureParams } from '../hooks/useSecureParams.js';
import api from '../utils/api.js';
import { useTranslation } from 'react-i18next';

export default function RecuperarContrasena() {
  const { t } = useTranslation();
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
      if (show) setEmailError(t('errores.campoRequerido', 'El correo es requerido.'));
      return false;
    }
    if (!isValidEmail(email.trim())) {
      if (show) setEmailError(t('errores.emailInvalido', 'Ingresa un correo válido.'));
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
      setResultMessage(t('recuperarContrasena.requestSent', "Si el correo existe, recibirás un enlace de recuperación en unos minutos."));
      setResultKind('info');
    } catch (error) {
      const msg = error?.mensaje || error?.message || t('recuperarContrasena.requestError', "No se pudo enviar el enlace.");
      setResultMessage(msg);
      setResultKind('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="left-panel">
        <a href="/login" className="brand">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24">
              <path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z" />
            </svg>
          </div>
          <div>
            <div className="brand-name">{t('general.appName', 'AgroMarket')}</div>
            <div className="brand-sub">{t('general.appSlogan', 'Plataforma de comercio agrícola')}</div>
          </div>
        </a>

        <div style={{ margin: "auto 0", maxWidth: "420px", width: "100%" }}>
          <h1 className="page-title">{t('recuperarContrasena.title', 'Recupera tu acceso')}</h1>
          <p className="page-sub">{t('recuperarContrasena.sub', 'Te enviaremos un enlace seguro al correo asociado a tu cuenta.')}</p>

          {resultMessage && (
            <div className={`result-box visible ${resultKind === 'error' ? 'error' : ''}`}>
              {resultMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">{t('auth.email', 'Correo electrónico')}</label>
              <input
                className={`form-input ${emailError ? 'error' : ''}`}
                id="email"
                type="email"
                placeholder={t('auth.emailPlaceholder', 'tu@correo.com')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => validateEmail(true)}
                autoComplete="email"
              />
              {emailError && <span className="form-error visible">{emailError}</span>}
            </div>

            <button className="btn-submit" disabled={loading} type="submit">
              {loading ? t('recuperarContrasena.sendingBtn', 'Enviando...') : t('recuperarContrasena.sendBtn', 'Enviar enlace')}
            </button>
          </form>

          <div className="divider"></div>

          <div className="form-footer">
            {t('recuperarContrasena.rememberedPassword', '¿Recordaste tu contraseña?')}{' '}
            <a href="/login">{t('auth.volverLogin', 'Volver al inicio de sesión')}</a>
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
          <div className="right-badge">🌿 {t('recuperarContrasena.badge', 'AgroMarket seguro')}</div>
          <h2 className="right-title">{t('recuperarContrasena.heroTitle', 'Restablece tu contraseña sin perder acceso a tus pedidos.')}</h2>
          <p className="right-sub">
            {t('recuperarContrasena.heroSub', 'El enlace caduca en 1 hora y solo funciona una vez para proteger tu cuenta.')}
          </p>

          <div className="hero-list">
            <div className="hero-item">
              <span>1</span>
              <div>
                <strong>{t('recuperarContrasena.step1Title', 'Correo verificado')}</strong><br />{t('recuperarContrasena.step1Desc', 'Usa el correo con el que te registraste.')}
              </div>
            </div>
            <div className="hero-item">
              <span>2</span>
              <div>
                <strong>{t('recuperarContrasena.step2Title', 'Enlace seguro')}</strong><br />{t('recuperarContrasena.step2Desc', 'Recibe un acceso temporal para definir tu nueva clave.')}
              </div>
            </div>
            <div className="hero-item">
              <span>3</span>
              <div>
                <strong>{t('recuperarContrasena.step3Title', 'Protección activa')}</strong><br />{t('recuperarContrasena.step3Desc', 'Los enlaces expiran automáticamente para tu seguridad.')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
