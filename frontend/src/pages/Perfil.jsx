import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api.js';
import { showToast } from '../utils/ui.js';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { normalizarRol } from '../utils/auth.js';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import '../styles/styles.css';
import '../styles/perfil.css';

function passwordRules(value) {
  return {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    number: /\d/.test(value),
    special: /[!@#$%^&*()_+\-=[\]{};':",.<>/?]/.test(value),
  };
}

function strengthFromRules(rules, t) {
  const count = Object.values(rules).filter(Boolean).length;
  if (count <= 1) return { label: t('perfil.passwordRulesWeak'), color: '#dc2626', pct: 25 };
  if (count === 2) return { label: t('perfil.passwordRulesAcceptable'), color: '#f59e0b', pct: 50 };
  if (count === 3) return { label: t('perfil.passwordRulesStrong'), color: '#84cc16', pct: 75 };
  return { label: t('perfil.passwordRulesVeryStrong'), color: '#2d7a3a', pct: 100 };
}

function getDashboardLink(rol) {
  const r = normalizarRol(rol);
  if (r === 'productor') return '/dashboard-productor';
  if (r === 'admin') return '/admin';
  return '/dashboard-comprador';
}

function PerfilContent() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [tfCode, setTfCode] = useState('');

  const fileRef = useRef();

  const rules = passwordRules(newPass);
  const strength = strengthFromRules(rules, t);

  useEffect(() => {
    const localPhoto = localStorage.getItem('fotoPerfil');
    if (localPhoto) setAvatarSrc(localPhoto);
    cargarPerfil();
    loadTwoFactorStatus();
  }, []);

  const cargarPerfil = async () => {
    try {
      const perfil = await api.getPerfil();
      setNombre(perfil.nombre || '');
      setCorreo(perfil.correo || '');
      setTelefono(perfil.telefono || '');
      if (perfil.fotoPerfil) setAvatarSrc(perfil.fotoPerfil);
    } catch (err) {
      showToast(err?.message || t('errores.profileLoadError'), 'error');
    }
  };

  const loadTwoFactorStatus = async () => {
    try {
      const status = await api.getTwoFactorStatus();
      setTwoFactorEnabled(Boolean(status?.enabled));
    } catch {
      setTwoFactorEnabled(false);
    }
  };

  const guardarPerfil = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) { showToast(t('errores.nameRequired'), 'error'); return; }
    setSavingProfile(true);
    try {
      await api.actualizarPerfil({ nombre: nombre.trim(), telefono: telefono.trim() });
      showToast(t('general.profileUpdatedSuccess'), 'success');
      if (refreshUser) refreshUser();
    } catch (err) {
      showToast(err?.message || t('errores.profileUpdateError'), 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const actualizarContrasena = async (e) => {
    e.preventDefault();
    if (!currentPass) { showToast(t('errores.currentPasswordRequired'), 'error'); return; }
    const valid = rules.length && rules.upper && rules.number && rules.special;
    if (!valid) { showToast(t('errores.passwordRequirementsNotMet'), 'error'); return; }
    if (newPass !== confirmPass) { showToast(t('errores.contrasenasNoCoinciden'), 'error'); return; }
    setSavingPass(true);
    try {
      await api.actualizarContrasena({ contrasenaActual: currentPass, nuevaContrasena: newPass });
      showToast(t('general.passwordUpdatedSuccess'), 'success');
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch (err) {
      showToast(err?.message || t('errores.passwordUpdateError'), 'error');
    } finally {
      setSavingPass(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const valid = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
    if (!valid) { showToast(t('errores.invalidImageFormat'), 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast(t('errores.imageSizeExceeded'), 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarSrc(ev.target.result);
      localStorage.setItem('fotoPerfil', ev.target.result);
      showToast(t('general.photoUpdatedLocally'), 'success');
    };
    reader.readAsDataURL(file);
  };

  const initTwoFactor = async () => {
    try {
      const setup = await api.initTwoFactorSetup();
      setTwoFactorSetup(setup);
      showToast(t('general.configureAuthenticatorApp'), 'info');
    } catch (err) {
      showToast(err?.message || t('errores.twoFactorInitError'), 'error');
    }
  };

  const enableTwoFactor = async () => {
    if (!/^[0-9]{6}$/.test(tfCode)) { showToast(t('errores.invalidOtpCode'), 'error'); return; }
    try {
      await api.confirmTwoFactorSetup(tfCode);
      setTwoFactorSetup(null); setTfCode('');
      await loadTwoFactorStatus();
      showToast(t('general.twoFactorActivated'), 'success');
    } catch (err) {
      showToast(err?.message || t('errores.twoFactorActivateError'), 'error');
    }
  };

  const disableTwoFactor = async () => {
    const code = window.prompt(t('perfil.enterCurrent2FACode'));
    if (!code) return;
    if (!/^[0-9]{6}$/.test(code)) { showToast(t('errores.invalidCode'), 'error'); return; }
    try {
      await api.disableTwoFactor(code);
      await loadTwoFactorStatus();
      showToast(t('general.twoFactorDeactivated'), 'success');
    } catch (err) {
      showToast(err?.message || t('errores.twoFactorDeactivateError'), 'error');
    }
  };

  const getInitials = (n) => (n || 'U').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1px solid rgba(45,106,79,.2)', fontSize: '0.95rem', boxSizing: 'border-box',
    outline: 'none',
  };

  const cardStyle = {
    background: '#fff', borderRadius: '16px',
    border: '1px solid rgba(45,106,79,.12)',
    padding: '28px 32px', marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,.04)',
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#1a3a2a' }}>{t('perfil.myProfileTitle')}</h1>
        <Link to={getDashboardLink(user?.rol)} style={{ padding: '8px 18px', borderRadius: '10px', background: '#f0fdf4', color: '#2d6a4f', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
          ← {t('perfil.backToDashboard')}
        </Link>
      </div>

      {/* Avatar + Info */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            {avatarSrc ? (
              <img src={avatarSrc} alt={t('general.photoOf', { name: user.nombre || t('general.user') })} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(45,106,79,.2)' }} />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg,#2d6a4f,#40916c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.4rem' }}>
                {getInitials(nombre || user?.nombre)}
              </div>
            )}
            <button type="button" onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: '26px', height: '26px', borderRadius: '50%', background: '#2d6a4f', color: '#fff', border: '2px solid #fff', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✏️
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1a3a2a' }}>{nombre || user?.nombre || t('general.user')}</div>
            <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '4px' }}>{correo || user?.email}</div>
            <div style={{ marginTop: '6px' }}>
              <span style={{ padding: '3px 10px', borderRadius: '999px', background: '#d1fae5', color: '#166534', fontSize: '0.78rem', fontWeight: 700 }}>
                {user?.rol || t('general.buyer')}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={guardarPerfil}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: '#374151' }}>{t('perfil.personalInfo')}</h2>
          <div style={{ display: 'grid', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{t('perfil.nameLabel')}</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={t('perfil.namePlaceholder')} style={inputStyle} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{t('perfil.emailLabel')}</label>
              <input type="email" value={correo} readOnly style={{ ...inputStyle, background: '#f9fafb', color: '#6b7280' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{t('perfil.phoneLabel')}</label>
              <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder={t('perfil.phonePlaceholder')} style={inputStyle} />
            </div>
          </div>
          <button type="submit" disabled={savingProfile} style={{ marginTop: '20px', padding: '10px 24px', borderRadius: '10px', border: 0, background: '#2d6a4f', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
            {savingProfile ? t('perfil.savingChanges') : t('perfil.saveChanges')}
          </button>
        </form>
      </div>

      {/* Password change */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: '#374151' }}>{t('perfil.changePasswordTitle')}</h2>
        <form onSubmit={actualizarContrasena}>
          <div style={{ display: 'grid', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{t('perfil.currentPasswordLabel')}</label>
              <input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} placeholder="••••••••" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{t('perfil.newPasswordLabel')}</label>
              <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="••••••••" style={inputStyle} />
              {newPass && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ height: '4px', borderRadius: '999px', background: '#e5e7eb', marginBottom: '6px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${strength.pct}%`, background: strength.color, transition: 'width .3s, background .3s' }} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: strength.color, fontWeight: 600 }}>{strength.label}</div>
                  <div style={{ display: 'grid', gap: '2px', marginTop: '6px', fontSize: '0.8rem', color: '#6b7280' }}>
                    <span style={{ color: rules.length ? '#2d6a4f' : '#9ca3af' }}>{rules.length ? '✓' : '•'} {t('perfil.passwordMinLength')}</span>
                    <span style={{ color: rules.upper ? '#2d6a4f' : '#9ca3af' }}>{rules.upper ? '✓' : '•'} {t('perfil.passwordUppercase')}</span>
                    <span style={{ color: rules.number ? '#2d6a4f' : '#9ca3af' }}>{rules.number ? '✓' : '•'} {t('perfil.passwordNumber')}</span>
                    <span style={{ color: rules.special ? '#2d6a4f' : '#9ca3af' }}>{rules.special ? '✓' : '•'} {t('perfil.passwordSpecialChar')}</span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{t('perfil.confirmPasswordLabel')}</label>
              <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="••••••••" style={inputStyle} />
              {confirmPass && newPass !== confirmPass && (
                <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#dc2626' }}>{t('errores.contrasenasNoCoinciden')}</div>
              )}
            </div>
          </div>
          <button type="submit" disabled={savingPass} style={{ marginTop: '20px', padding: '10px 24px', borderRadius: '10px', border: 0, background: '#2d6a4f', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
            {savingPass ? t('perfil.updatingPassword') : t('perfil.updatePassword')}
          </button>
        </form>
      </div>

      {/* 2FA */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: '#374151' }}>{t('perfil.twoFactorAuthTitle')}</h2>
        <div style={{ padding: '10px 14px', borderRadius: '10px', background: twoFactorEnabled ? '#d1fae5' : '#f0f9ff', color: twoFactorEnabled ? '#166534' : '#1e40af', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px' }}>
          {twoFactorEnabled ? t('perfil.twoFactorEnabled') : t('perfil.twoFactorDisabled')}
        </div>

        {!twoFactorEnabled && !twoFactorSetup && (
          <button type="button" onClick={initTwoFactor} style={{ padding: '10px 20px', borderRadius: '10px', border: 0, background: '#2d6a4f', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
            {t('perfil.activate2FA')}
          </button>
        )}

        {twoFactorSetup && (
          <div style={{ marginTop: '16px', display: 'grid', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{t('perfil.secretKeyLabel')}</label>
              <input type="text" value={twoFactorSetup.secret || ''} readOnly style={{ ...inputStyle, background: '#f9fafb', fontFamily: 'monospace' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{t('perfil.verificationCodeLabel')}</label>
              <input type="text" value={tfCode} onChange={(e) => setTfCode(e.target.value)} maxLength={6} placeholder="123456" style={inputStyle} />
            </div>
            <button type="button" onClick={enableTwoFactor} style={{ padding: '10px 20px', borderRadius: '10px', border: 0, background: '#2d6a4f', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
              {t('perfil.confirmAndActivate')}
            </button>
          </div>
        )}

        {twoFactorEnabled && (
          <button type="button" onClick={disableTwoFactor} style={{ padding: '10px 20px', borderRadius: '10px', border: 0, background: '#fef2f2', color: '#991b1b', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
            {t('perfil.deactivate2FA')}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Perfil() {
  return (
    <>
      <Navbar />
      <ProtectedRoute>
        <PerfilContent />
      </ProtectedRoute>
    </>
  );
}