// File: frontend/src/components/Perfil.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api.js';
import { showToast } from '../utils/ui.js';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from './Navbar.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import { normalizarRol } from '../utils/auth.js';

function passwordRules(value) {
  return {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    number: /\d/.test(value),
    special: /[!@#$%^&*()_+\-=[\]{};':",.<>/?]/.test(value),
  };
}

function strengthFromRules(rules) {
  const count = Object.values(rules).filter(Boolean).length;
  if (count <= 1) return { label: 'Débil', color: '#dc2626', pct: 25 };
  if (count === 2) return { label: 'Aceptable', color: '#f59e0b', pct: 50 };
  if (count === 3) return { label: 'Fuerte', color: '#84cc16', pct: 75 };
  return { label: 'Muy fuerte', color: '#2d7a3a', pct: 100 };
}

function getDashboardLink(rol) {
  const r = normalizarRol(rol);
  if (r === 'productor') return '/dashboard-productor.html';
  if (r === 'admin') return '/admin.html';
  return '/dashboard-comprador.html';
}

function PerfilContent() {
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
  const strength = strengthFromRules(rules);

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
      showToast(err?.message || 'No se pudo cargar el perfil.', 'error');
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
    if (!nombre.trim()) { showToast('El nombre es requerido.', 'error'); return; }
    setSavingProfile(true);
    try {
      await api.actualizarPerfil({ nombre: nombre.trim(), telefono: telefono.trim() });
      showToast('Perfil actualizado correctamente.', 'success');
      if (refreshUser) refreshUser();
    } catch (err) {
      showToast(err?.message || 'No se pudo actualizar el perfil.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const actualizarContrasena = async (e) => {
    e.preventDefault();
    if (!currentPass) { showToast('Ingresa tu contraseña actual.', 'error'); return; }
    const valid = rules.length && rules.upper && rules.number && rules.special;
    if (!valid) { showToast('La contraseña no cumple los requisitos.', 'error'); return; }
    if (newPass !== confirmPass) { showToast('Las contraseñas no coinciden.', 'error'); return; }
    setSavingPass(true);
    try {
      await api.actualizarContrasena({ contrasenaActual: currentPass, nuevaContrasena: newPass });
      showToast('Contraseña actualizada correctamente.', 'success');
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch (err) {
      showToast(err?.message || 'No se pudo actualizar la contraseña.', 'error');
    } finally {
      setSavingPass(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const valid = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
    if (!valid) { showToast('Solo JPG, PNG o WEBP.', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('La imagen no puede superar 5 MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarSrc(ev.target.result);
      localStorage.setItem('fotoPerfil', ev.target.result);
      showToast('Foto actualizada localmente.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const initTwoFactor = async () => {
    try {
      const setup = await api.initTwoFactorSetup();
      setTwoFactorSetup(setup);
      showToast('Configura tu app Authenticator con el código proporcionado.', 'info');
    } catch (err) {
      showToast(err?.message || 'No se pudo iniciar la configuración 2FA.', 'error');
    }
  };

  const enableTwoFactor = async () => {
    if (!/^[0-9]{6}$/.test(tfCode)) { showToast('Ingresa un código válido de 6 dígitos.', 'error'); return; }
    try {
      await api.confirmTwoFactorSetup(tfCode);
      setTwoFactorSetup(null); setTfCode('');
      await loadTwoFactorStatus();
      showToast('Autenticación en dos pasos activada.', 'success');
    } catch (err) {
      showToast(err?.message || 'No se pudo activar 2FA.', 'error');
    }
  };

  const disableTwoFactor = async () => {
    const code = window.prompt('Ingresa tu código actual de Authenticator para desactivar 2FA:');
    if (!code) return;
    if (!/^[0-9]{6}$/.test(code)) { showToast('Código inválido.', 'error'); return; }
    try {
      await api.disableTwoFactor(code);
      await loadTwoFactorStatus();
      showToast('Autenticación en dos pasos desactivada.', 'success');
    } catch (err) {
      showToast(err?.message || 'No se pudo desactivar 2FA.', 'error');
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
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#1a3a2a' }}>Mi Perfil</h1>
        <a href={getDashboardLink(user?.rol)} style={{ padding: '8px 18px', borderRadius: '10px', background: '#f0fdf4', color: '#2d6a4f', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Volver al panel
        </a>
      </div>

      {/* Avatar + Info */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(45,106,79,.2)' }} />
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
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1a3a2a' }}>{nombre || user?.nombre || 'Usuario'}</div>
            <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '4px' }}>{correo || user?.email}</div>
            <div style={{ marginTop: '6px' }}>
              <span style={{ padding: '3px 10px', borderRadius: '999px', background: '#d1fae5', color: '#166534', fontSize: '0.78rem', fontWeight: 700 }}>
                {user?.rol || 'comprador'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={guardarPerfil}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: '#374151' }}>Información personal</h2>
          <div style={{ display: 'grid', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Nombre *</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre completo" style={inputStyle} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Correo electrónico</label>
              <input type="email" value={correo} readOnly style={{ ...inputStyle, background: '#f9fafb', color: '#6b7280' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Teléfono</label>
              <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+57 300 000 0000" style={inputStyle} />
            </div>
          </div>
          <button type="submit" disabled={savingProfile} style={{ marginTop: '20px', padding: '10px 24px', borderRadius: '10px', border: 0, background: '#2d6a4f', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
            {savingProfile ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {/* Password change */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: '#374151' }}>Cambiar contraseña</h2>
        <form onSubmit={actualizarContrasena}>
          <div style={{ display: 'grid', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Contraseña actual *</label>
              <input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} placeholder="••••••••" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Nueva contraseña *</label>
              <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="••••••••" style={inputStyle} />
              {newPass && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ height: '4px', borderRadius: '999px', background: '#e5e7eb', marginBottom: '6px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${strength.pct}%`, background: strength.color, transition: 'width .3s, background .3s' }} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: strength.color, fontWeight: 600 }}>{strength.label}</div>
                  <div style={{ display: 'grid', gap: '2px', marginTop: '6px', fontSize: '0.8rem', color: '#6b7280' }}>
                    <span style={{ color: rules.length ? '#2d6a4f' : '#9ca3af' }}>{rules.length ? '✓' : '•'} Mínimo 8 caracteres</span>
                    <span style={{ color: rules.upper ? '#2d6a4f' : '#9ca3af' }}>{rules.upper ? '✓' : '•'} Una mayúscula</span>
                    <span style={{ color: rules.number ? '#2d6a4f' : '#9ca3af' }}>{rules.number ? '✓' : '•'} Un número</span>
                    <span style={{ color: rules.special ? '#2d6a4f' : '#9ca3af' }}>{rules.special ? '✓' : '•'} Un carácter especial</span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Confirmar contraseña *</label>
              <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="••••••••" style={inputStyle} />
              {confirmPass && newPass !== confirmPass && (
                <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#dc2626' }}>Las contraseñas no coinciden.</div>
              )}
            </div>
          </div>
          <button type="submit" disabled={savingPass} style={{ marginTop: '20px', padding: '10px 24px', borderRadius: '10px', border: 0, background: '#2d6a4f', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
            {savingPass ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>

      {/* 2FA */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: '#374151' }}>Autenticación en dos pasos (2FA)</h2>
        <div style={{ padding: '10px 14px', borderRadius: '10px', background: twoFactorEnabled ? '#d1fae5' : '#f0f9ff', color: twoFactorEnabled ? '#166534' : '#1e40af', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px' }}>
          {twoFactorEnabled ? '✅ Autenticación en dos pasos ACTIVADA' : 'ℹ️ Autenticación en dos pasos DESACTIVADA'}
        </div>

        {!twoFactorEnabled && !twoFactorSetup && (
          <button type="button" onClick={initTwoFactor} style={{ padding: '10px 20px', borderRadius: '10px', border: 0, background: '#2d6a4f', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
            Activar 2FA
          </button>
        )}

        {twoFactorSetup && (
          <div style={{ marginTop: '16px', display: 'grid', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Clave secreta:</label>
              <input type="text" value={twoFactorSetup.secret || ''} readOnly style={{ ...inputStyle, background: '#f9fafb', fontFamily: 'monospace' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Código de verificación (6 dígitos):</label>
              <input type="text" value={tfCode} onChange={(e) => setTfCode(e.target.value)} maxLength={6} placeholder="123456" style={inputStyle} />
            </div>
            <button type="button" onClick={enableTwoFactor} style={{ padding: '10px 20px', borderRadius: '10px', border: 0, background: '#2d6a4f', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
              Confirmar y activar
            </button>
          </div>
        )}

        {twoFactorEnabled && (
          <button type="button" onClick={disableTwoFactor} style={{ padding: '10px 20px', borderRadius: '10px', border: 0, background: '#fef2f2', color: '#991b1b', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
            Desactivar 2FA
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
