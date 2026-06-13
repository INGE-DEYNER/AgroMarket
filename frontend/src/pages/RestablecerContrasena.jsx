import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import '../styles/login.css';

export default function RestablecerContrasena() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const email = location.state?.email || '';

  const [step, setStep] = useState(1); // 1: verify code, 2: set new password
  const [codigo, setCodigo] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!email) {
      setError(t('resetPass.emailError', 'No se ha proporcionado un correo electrónico. Por favor, solicita un nuevo código.'));
    }
  }, [email]);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!email) return;
    if (!codigo) { setError(t('resetPass.inputCodeError', 'Ingresa el código de 6 dígitos.')); return; }
    
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-code', { correo: email, codigo });
      setTempToken(res.tempToken);
      setStep(2);
      setSuccess(t('resetPass.codeVerified', 'Código verificado. Ahora ingresa tu nueva contraseña.'));
    } catch (err) {
      setError(err.message || t('resetPass.codeVerifyError', 'Código incorrecto o expirado.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError(t('errors.minPassword', 'La contraseña debe tener al menos 6 caracteres.')); return; }
    if (password !== confirmPass) { setError(t('errors.passwordMismatch', 'Las contraseñas no coinciden.')); return; }
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/restablecer-contrasena', { token: tempToken, nuevaContrasena: password });
      setSuccess(t('resetPass.resetSuccess', 'Contraseña restablecida con éxito. Redirigiendo al inicio de sesión...'));
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || t('resetPass.resetError', 'Error al restablecer la contraseña.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="left-panel">
        <Link to="/home" className="brand">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z" /></svg>
          </div>
          <div>
            <div className="brand-name">AgroMarket</div>
            <div className="brand-sub">ASAFRUT · Chigorodó, Antioquia</div>
          </div>
        </Link>

        <div style={{ margin: 'auto 0', maxWidth: '400px', width: '100%' }}>
          <h1 className="page-title">{t('resetPass.title', 'Restablecer contraseña')}</h1>
          <p className="page-sub">
            {step === 1 ? t('resetPass.subStep1', 'Ingresa el código que enviamos a tu correo.') : t('resetPass.subStep2', 'Crea tu nueva contraseña segura.')}
          </p>

          {error && <div className="global-error" style={{ display: 'block', marginBottom: '16px' }}>{error}</div>}
          {success && step === 2 && !tempToken && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '3rem' }}>✅</div>
              <p style={{ marginTop: '16px' }}>{success}</p>
            </div>
          )}

          {!email && !success && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link to="/recuperar-contrasena" className="btn-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>
                {t('resetPass.requestNewCodeBtn', 'Solicitar nuevo código')}
              </Link>
            </div>
          )}

          {email && step === 1 && (
            <form onSubmit={handleVerifyCode}>
              <div className="form-group">
                <label className="form-label">{t('auth.email', 'Correo electrónico')}</label>
                <input className="form-input" type="email" value={email} disabled />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="codigo">{t('forgotPass.codeLabel', 'Código de recuperación')}</label>
                <input 
                  className="form-input" 
                  type="text" 
                  id="codigo" 
                  placeholder={t('resetPass.codePlaceholder', '123456')} 
                  maxLength={6} 
                  value={codigo} 
                  onChange={(e) => setCodigo(e.target.value)} 
                  style={{ letterSpacing: '8px', fontSize: '1.2rem', textAlign: 'center' }} 
                  disabled={loading}
                />
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? t('verifyEmail.verifyingBtn', 'Verificando...') : t('resetPass.verifyBtn', 'Verificar código')}
              </button>
            </form>
          )}

          {step === 2 && !(!tempToken && success) && (
            <form onSubmit={handleResetPassword}>
              {success && <div style={{ color: '#27ae60', marginBottom: '16px', fontWeight: '500' }}>{success}</div>}
              <div className="form-group">
                <label className="form-label" htmlFor="password">{t('resetPass.newPassword', 'Nueva contraseña')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPass">{t('auth.confirmPassword', 'Confirmar contraseña')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type={showConfirmPass ? "text" : "password"}
                    id="confirmPass"
                    placeholder="••••••••"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    disabled={loading}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    aria-label={showConfirmPass ? "Hide password" : "Show password"}
                  >
                    {showConfirmPass ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? t('resetPass.savingBtn', 'Guardando...') : t('resetPass.saveBtn', 'Guardar nueva contraseña')}
              </button>
            </form>
          ) /* end step 2 */ }

          <div className="form-footer" style={{ marginTop: '24px' }}>
            <Link to="/login">{t('forgotPass.backToLogin', '← Volver al inicio de sesión')}</Link>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200" alt="Cultivos" className="bg-img" />
        <div className="right-overlay">
          <div className="right-badge">{t('forgotPass.badge', '🌿 AgroMarket ASAFRUT')}</div>
          <h2 className="right-title">{t('resetPass.rightTitle', 'Tu nueva contraseña es tu llave.')}</h2>
          <p className="right-sub">{t('resetPass.rightSub', 'Crea una contraseña segura para proteger tu cuenta.')}</p>
        </div>
      </div>
    </div>
  );
}
