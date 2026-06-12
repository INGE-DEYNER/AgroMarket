import '../styles/restablecer-contrasena.css';
import React, { useState, useEffect } from 'react';
import { useSecureParams } from '../hooks/useSecureParams.js';
import api from '../utils/api.js';
import { useTranslation } from 'react-i18next';

export default function RestablecerContrasena() {
  const { t } = useTranslation();
  const { getParam } = useSecureParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [resultKind, setResultKind] = useState('info');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const search = window.location.search;

  useEffect(() => {
    const tokenParam = getParam('token') || '';
    setToken(tokenParam);
    if (!tokenParam && search) {
      setResultMessage(t('resetPassword.invalidToken', 'El enlace no contiene un token válido.'));
      setResultKind('error');
    }
  }, [search, getParam, t]);

  const passwordRules = (val) => {
    return {
      length: val.length >= 8,
      upper: /[A-Z]/.test(val),
      number: /\d/.test(val),
      special: /[!@#$%^&*()_+\-=[\]{};':",.<>/?]/.test(val),
    };
  };

  const getStrengthMetrics = () => {
    const rules = passwordRules(password);
    const count = Object.values(rules).filter(Boolean).length;
    const pct = (count / 4) * 100;
    
    let label = t('perfil.passwordRulesWeak', 'Débil');
    let color = '#dc2626';
    if (count === 2) {
      label = t('perfil.passwordRulesAcceptable', 'Aceptable');
      color = '#f59e0b';
    } else if (count === 3) {
      label = t('perfil.passwordRulesStrong', 'Fuerte');
      color = '#84cc16';
    } else if (count === 4) {
      label = t('perfil.passwordRulesVeryStrong', 'Muy fuerte');
      color = '#2d7a3a';
    }
    return { rules, count, pct, label, color };
  };

  const metrics = getStrengthMetrics();

  const validatePassword = (show = true) => {
    const rules = passwordRules(password);
    const valid = rules.length && rules.upper && rules.number && rules.special;
    if (!password && !show) {
      setPasswordError('');
      return false;
    }
    if (!valid) {
      if (show) setPasswordError(t('errores.passwordRequirements', "Debe tener 8 caracteres, una mayúscula, un número y un carácter especial."));
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirm = (show = true) => {
    const matches = confirm && confirm === password;
    if (!confirm && !show) {
      setConfirmError('');
      return false;
    }
    if (!matches) {
      if (show) setConfirmError(t('errores.contrasenasNoCoinciden', "Las contraseñas no coinciden."));
      return false;
    }
    setConfirmError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResultMessage('');

    if (!token) {
      setResultMessage(t('resetPassword.invalidToken', "El enlace no contiene un token válido."));
      setResultKind('error');
      return;
    }

    const isPasswordValid = validatePassword(true);
    const isConfirmValid = validateConfirm(true);
    if (!isPasswordValid || !isConfirmValid) return;

    setLoading(true);
    try {
      await api.confirmPasswordReset(token, password);
      setResultMessage(t('resetPassword.updatedSuccess', "Contraseña actualizada correctamente. Redirigiendo al inicio de sesión..."));
      setResultKind('info');
      setTimeout(() => {
        window.location.assign("/login");
      }, 1800);
    } catch (error) {
      const msg = error?.mensaje || error?.message || t('resetPassword.updateError', "No se pudo restablecer la contraseña.");
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
          <h1 className="page-title">{t('resetPassword.title', 'Define tu nueva contraseña')}</h1>
          <p className="page-sub">
            {t('resetPassword.sub', 'El enlace de recuperación debe venir en la URL. Completa ambos campos para continuar.')}
          </p>

          {resultMessage && (
            <div className={`result-box visible ${resultKind === 'error' ? 'error' : ''}`}>
              {resultMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="password">{t('perfil.newPasswordLabel', 'Nueva contraseña')}</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  className={`form-input ${passwordError ? 'error' : ''}`}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => validatePassword(true)}
                  autoComplete="new-password"
                  style={{ paddingRight: "88px", flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: 0,
                    background: "transparent",
                    color: "#2d7a3a",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: "4px 6px",
                  }}
                >
                  {showPassword ? t('auth.hidePassword', 'Ocultar') : t('auth.showPassword', 'Mostrar')}
                </button>
              </div>

              <div className="strength-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                  <span className="form-label" style={{ margin: 0 }}>{t('auth.passwordStrength', 'Fortaleza')}</span>
                  <span style={{ fontWeight: 700, color: metrics.color }}>{metrics.label}</span>
                </div>
                <div className="strength-bar-track">
                  <div className="strength-bar" style={{ width: `${metrics.pct}%`, background: metrics.color }}></div>
                </div>
                <div className="strength-requirements">
                  <div>{metrics.rules.length ? "✓" : "•"} {t('perfil.passwordMinLength', 'Mínimo 8 caracteres')}</div>
                  <div>{metrics.rules.upper ? "✓" : "•"} {t('perfil.passwordUppercase', 'Una mayúscula')}</div>
                  <div>{metrics.rules.number ? "✓" : "•"} {t('perfil.passwordNumber', 'Un número')}</div>
                  <div>{metrics.rules.special ? "✓" : "•"} {t('perfil.passwordSpecialChar', 'Un carácter especial')}</div>
                </div>
              </div>
              {passwordError && <span className="form-error visible">{passwordError}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm">{t('perfil.confirmPasswordLabel', 'Confirmar contraseña')}</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  className={`form-input ${confirmError ? 'error' : ''}`}
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onBlur={() => validateConfirm(true)}
                  autoComplete="new-password"
                  style={{ paddingRight: "88px", flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: 0,
                    background: "transparent",
                    color: "#2d7a3a",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: "4px 6px",
                  }}
                >
                  {showConfirm ? t('auth.hidePassword', 'Ocultar') : t('auth.showPassword', 'Mostrar')}
                </button>
              </div>
              {confirmError && <span className="form-error visible">{confirmError}</span>}
            </div>

            <button className="btn-submit" disabled={loading || !token} type="submit">
              {loading ? t('resetPassword.resettingBtn', 'Restableciendo...') : t('resetPassword.resetBtn', 'Restablecer contraseña')}
            </button>
          </form>

          <div className="divider"></div>

          <div className="form-footer">
            {t('resetPassword.notYourAccount', '¿No era tu cuenta?')}{' '}
            <a href="/login">{t('auth.volverLogin', 'Volver a iniciar sesión')}</a>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200"
          alt="Campo agrícola"
          className="bg-img"
        />
        <div className="right-overlay">
          <div className="right-badge">🔐 {t('resetPassword.badge', 'Seguridad AgroMarket')}</div>
          <h2 className="right-title">{t('resetPassword.heroTitle', 'Protege tu acceso con una clave fuerte.')}</h2>
          <p className="right-sub">
            {t('resetPassword.heroSub', 'Tu nueva contraseña debe cumplir con los requisitos de seguridad antes de guardarse.')}
          </p>

          <div className="hero-note">
            <div className="hero-note-item">
              <strong>{t('resetPassword.hint1Title', 'Mayúscula, número y especial')}</strong><br />{t('resetPassword.hint1Desc', 'La validación se actualiza en tiempo real.')}
            </div>
            <div className="hero-note-item">
              <strong>{t('resetPassword.hint2Title', 'Confirmación obligatoria')}</strong><br />{t('resetPassword.hint2Desc', 'Ambos campos deben coincidir exactamente.')}
            </div>
            <div className="hero-note-item">
              <strong>{t('resetPassword.hint3Title', 'Redirección automática')}</strong><br />{t('resetPassword.hint3Desc', 'Cuando guardes el cambio volverás al login.')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
