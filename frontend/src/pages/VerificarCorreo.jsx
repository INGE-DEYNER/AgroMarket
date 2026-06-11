import '../styles/verificar-correo.css';
import React, { useState, useEffect, useRef } from 'react';
import { useSecureParams } from '../hooks/useSecureParams.js';
import api from '../utils/api.js';
import { useTranslation } from 'react-i18next';

export default function VerificarCorreo() {
  const { t } = useTranslation();
  const { getParam } = useSecureParams();
  const [correo, setCorreo] = useState('');
  const [tokenMode, setTokenMode] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resultMessage, setResultMessage] = useState('');
  const [resultKind, setResultKind] = useState('info');
  const [timerText, setTimerText] = useState('15:00');
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  const search = window.location.search;
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const pathToken = pathParts[0] === "verificar" && pathParts[1] ? decodeURIComponent(pathParts[1]) : "";

  useEffect(() => {
    const isToken = !!pathToken;
    setTokenMode(isToken);

    const emailParam = getParam('correo') || sessionStorage.getItem('pendingVerificationEmail') || localStorage.getItem('correo') || '';
    setCorreo(emailParam);

    const codeParam = getParam('codigo') || pathToken || '';
    if (codeParam && codeParam.length === 6) {
      setCode(codeParam.split(''));
    }

    if (!isToken && !emailParam) {
      setResultMessage(t('verifyEmail.noEmailFound', 'No encontramos un correo para verificar.'));
      setResultKind('error');
    }
  }, [search, pathToken, getParam, t]);

  const storageKey = `agromarket.verification.expiry.${correo.toLowerCase() || "default"}`;

  useEffect(() => {
    if (!correo) return;

    const getExpiry = () => {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? Number(raw) : Number.NaN;
      return Number.isFinite(parsed) && parsed > Date.now() ? parsed : null;
    };

    const setExpiry = (durationMs = 15 * 60 * 1000) => {
      const current = getExpiry();
      if (current) return current;
      const expiry = Date.now() + durationMs;
      localStorage.setItem(storageKey, String(expiry));
      return expiry;
    };

    setExpiry();

    const interval = setInterval(() => {
      const expiry = getExpiry();
      const remainingSeconds = Math.ceil(((expiry || Date.now()) - Date.now()) / 1000);
      
      if (remainingSeconds <= 0) {
        setTimerText("00:00");
        setCanResend(true);
        clearInterval(interval);
      } else {
        const safe = Math.max(remainingSeconds, 0);
        const minutes = String(Math.floor(safe / 60)).padStart(2, "0");
        const remaining = String(safe % 60).padStart(2, "0");
        setTimerText(`${minutes}:${remaining}`);
        setCanResend(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [correo, storageKey]);

  const maskEmail = (emailStr) => {
    if (!emailStr?.includes("@")) return emailStr || t('verifyEmail.yourEmailFallback', "tu correo");
    const [user, domain] = emailStr.split("@");
    if (user.length <= 2) {
      return `${user[0]}***@${domain}`;
    }
    return `${user[0]}***${user[user.length - 1]}@${domain}`;
  };

  const handleInputChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 1);
    const newCode = [...code];
    newCode[index] = cleanValue;
    setCode(newCode);

    if (cleanValue && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pastedText.length; i++) {
      newCode[i] = pastedText[i];
    }
    setCode(newCode);
    const focusIdx = Math.min(pastedText.length, 5);
    inputsRef.current[focusIdx]?.focus();
  };

  const verifyCode = async (e) => {
    if (e) e.preventDefault();
    if (!tokenMode && !correo) {
      setResultMessage(t('verifyEmail.noEmailFound', "No encontramos un correo para verificar."));
      setResultKind('error');
      return;
    }

    setLoading(true);
    setResultMessage('');

    try {
      let resp = null;
      if (tokenMode) {
        resp = await api.verifyEmail(pathToken);
      } else {
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
          setResultMessage(t('verifyEmail.enterFullCode', "Ingresa el código completo de 6 dígitos."));
          setResultKind('error');
          setLoading(false);
          return;
        }
        resp = await api.verifyEmailCode(correo, fullCode);
      }

      sessionStorage.removeItem("pendingVerificationEmail");
      const pendiente = resp && resp.pendiente;
      if (pendiente) {
        setResultMessage(t('verifyEmail.verifiedPendingApproval', "Correo verificado. Tu cuenta está pendiente de aprobación por un administrador."));
        setResultKind('info');
      } else {
        setResultMessage(t('verifyEmail.verifiedRedirecting', "Correo verificado. Redirigiendo al inicio de sesión..."));
        setResultKind('info');
      }

      setTimeout(() => {
        window.location.assign("/login.html");
      }, 1800);
    } catch (error) {
      const msg = error?.mensaje || error?.message || t('verifyEmail.verificationError', "No se pudo verificar el correo.");
      setResultMessage(msg);
      setResultKind('error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (!correo) {
      setResultMessage(t('verifyEmail.noEmailForResend', "No encontramos un correo para reenviar el código."));
      setResultKind('error');
      return;
    }

    try {
      await api.resendVerification(correo);
      localStorage.removeItem(storageKey);
      setResultMessage(t('verifyEmail.codeResent', "Código reenviado. Revisa tu correo."));
      setResultKind('info');
    } catch (error) {
      const msg = error?.mensaje || error?.message || t('verifyEmail.resendError', "No se pudo reenviar el código.");
      setResultMessage(msg);
      setResultKind('error');
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
            <div className="brand-name">{t('general.appName', 'AgroMarket')}</div>
            <div className="brand-sub">{t('general.appSlogan', 'Plataforma de comercio agrícola')}</div>
          </div>
        </a>

        <div className="verify-wrap" style={{ margin: "auto 0", maxWidth: "440px", width: "100%" }}>
          <h1 className="page-title">{t('verifyEmail.title', 'Verifica tu correo')}</h1>
          <p className="page-sub">
            {t('verifyEmail.enterCodeInstructions', 'Ingresa el código de 6 dígitos que enviamos a')}{' '}
            <span className="masked-email">
              {tokenMode ? t('verifyEmail.yourVerificationLink', "tu enlace de verificación") : maskEmail(correo)}
            </span>.
          </p>

          {resultMessage && (
            <div className={`verification-state visible ${resultKind === 'error' ? 'error' : ''}`}>
              {resultMessage}
            </div>
          )}

          <form onSubmit={verifyCode} noValidate>
            <div className="otp-grid" aria-label={t('verifyEmail.otpGridLabel', "Código de verificación")}>
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  className="otp-input"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  aria-label={t('verifyEmail.digitLabel', { defaultValue: 'Dígito {{number}}', number: idx + 1 })}
                />
              ))}
            </div>

            <div className="verify-meta">
              <div className="timer-pill">⏳ <span>{timerText}</span></div>
              <a
                href="#"
                onClick={handleResend}
                className={`resend-link ${!canResend ? 'is-disabled' : ''}`}
                aria-disabled={!canResend}
              >
                {t('verifyEmail.resendLink', 'Reenviar código')}
              </a>
            </div>

            <button className="btn-submit" disabled={loading || code.join('').length !== 6} type="submit">
              {loading ? t('verifyEmail.verifying', 'Verificando...') : t('verifyEmail.verifyBtn', 'Verificar código')}
            </button>
          </form>

          <div className="divider"></div>

          <div className="form-footer">
            {t('verifyEmail.alreadyVerified', '¿Ya verificaste?')}{' '}
            <a href="login.html">{t('auth.volverLogin', 'Volver al inicio de sesión')}</a>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <img
          src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200"
          alt="Cultivos de fruta"
          className="bg-img"
        />
        <div className="right-overlay">
          <div className="right-badge">📩 {t('verifyEmail.secureVerificationBadge', 'Verificación segura')}</div>
          <h2 className="right-title">{t('verifyEmail.heroTitle', 'Activa tu cuenta para comprar y vender con confianza.')}</h2>
          <p className="right-sub">
            {t('verifyEmail.heroSub', 'El código expira en 15 minutos. Si necesitas otro, podrás reenviarlo cuando el temporizador llegue a cero.')}
          </p>

          <div className="verify-hints">
            <div className="verify-hint">
              <strong>{t('verifyEmail.autocompleteTitle', 'Autocompletado')}</strong><br />{t('verifyEmail.autocompleteDesc', 'Puedes pegar los 6 dígitos de una sola vez.')}
            </div>
            <div className="verify-hint">
              <strong>{t('verifyEmail.controlledResendTitle', 'Reenvío controlado')}</strong><br />{t('verifyEmail.controlledResendDesc', 'El botón de reenviar se activa solo al expirar el contador.')}
            </div>
            <div className="verify-hint">
              <strong>{t('verifyEmail.immediateAccessTitle', 'Acceso inmediato')}</strong><br />{t('verifyEmail.immediateAccessDesc', 'Cuando verifiques, te llevaremos al login para entrar al sistema.')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
