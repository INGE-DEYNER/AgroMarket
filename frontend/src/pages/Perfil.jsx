import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/styles.css';
import '../styles/perfil.css';

function getInitials(value) {
  return (value || 'U')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

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
  const r = (rol || '').toLowerCase();
  if (r.includes('productor')) return '/dashboard-productor';
  if (r.includes('admin')) return '/admin';
  return '/dashboard-comprador';
}

export default function Perfil() {
  const { user } = useAuth();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [avatarSrc, setAvatarSrc] = useState(null);

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [tfCode, setTfCode] = useState('');

  const fileRef = useRef(null);

  const rules = passwordRules(newPass);
  const strength = strengthFromRules(rules);

  useEffect(() => {
    const localPhoto = localStorage.getItem('fotoPerfil');
    if (localPhoto) setAvatarSrc(localPhoto);
    loadProfile();
    loadTwoFactorStatus();
  }, []);

  const loadProfile = async () => {
    try {
      const perfil = await fetch('/api/perfil').then((r) => r.json());
      setNombre(perfil.nombre || '');
      setCorreo(perfil.correo || '');
      setTelefono(perfil.telefono || '');
      if (perfil.fotoPerfil) setAvatarSrc(perfil.fotoPerfil);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTwoFactorStatus = async () => {
    try {
      const status = await fetch('/api/auth/2fa/estado').then((r) => r.json());
      setTwoFactorEnabled(Boolean(status?.enabled));
    } catch {
      setTwoFactorEnabled(false);
    }
  };

  const handleSidebarLogoClick = () => {
    /* placeholder for dashboard navigation when wrapped by router */
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
    window.location.href = '/login';
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim(), telefono: telefono.trim() }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      const box = document.getElementById('profileAlert');
      box.style.display = 'block';
      box.className = 'alert-box success';
      box.textContent = 'Perfil actualizado correctamente.';
    } catch (err) {
      const box = document.getElementById('profileAlert');
      box.style.display = 'block';
      box.className = 'alert-box error';
      box.textContent = err.message || 'Error al actualizar el perfil.';
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    const currentError = document.getElementById('currentPasswordError');
    const newError = document.getElementById('newPasswordError');
    const confirmError = document.getElementById('confirmPasswordError');
    const alertBox = document.getElementById('passwordAlert');

    currentError.style.display = 'none';
    newError.style.display = 'none';
    confirmError.style.display = 'none';
    alertBox.style.display = 'none';

    const validLength = currentPass.length > 0;
    if (!validLength) {
      currentError.style.display = 'block';
    }

    const validRules = rules.length && rules.upper && rules.number && rules.special;
    if (!validRules) {
      newError.style.display = 'block';
    }

    const passwordsMatch = newPass === confirmPass;
    if (!passwordsMatch) {
      confirmError.style.display = 'block';
    }

    if (!validLength || !validRules || !passwordsMatch) return;

    try {
      const res = await fetch('/api/auth/cambiar-clave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contrasenaActual: currentPass, nuevaContrasena: newPass }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Error al cambiar la contraseña.');
      }
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      alertBox.style.display = 'block';
      alertBox.className = 'alert-box success';
      alertBox.textContent = 'Contraseña actualizada correctamente.';
    } catch (err) {
      alertBox.style.display = 'block';
      alertBox.className = 'alert-box error';
      alertBox.textContent = err.message || 'Error al cambiar la contraseña.';
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = document.getElementById('avatarPreview');
    const loading = document.getElementById('avatarLoading');
    const valid = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
    if (!valid) {
      alert('Formato de imagen no válido. Usa PNG, JPG o WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar 5MB.');
      return;
    }
    loading.style.display = 'flex';
    const reader = new FileReader();
    reader.onload = (ev) => {
      localStorage.setItem('fotoPerfil', ev.target.result);
      setAvatarSrc(ev.target.result);
      preview.src = ev.target.result;
      loading.style.display = 'none';
    };
    reader.onerror = () => {
      loading.style.display = 'none';
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const updateStrengthUI = () => {
      const bar = document.getElementById('strengthBar');
      const label = document.getElementById('strengthLabel');
      if (!bar || !label) return;

      bar.style.width = `${strength.pct}%`;
      bar.style.background = strength.color;
      label.textContent = strength.label;
      label.style.color = strength.color;
    };
    updateStrengthUI();
  }, [newPass]);

  useEffect(() => {
    const reqLength = document.getElementById('reqLength');
    const reqUpper = document.getElementById('reqUpper');
    const reqNumber = document.getElementById('reqNumber');
    const reqSpecial = document.getElementById('reqSpecial');
    if (reqLength) reqLength.style.color = rules.length ? '#2d7a3a' : undefined;
    if (reqUpper) reqUpper.style.color = rules.upper ? '#2d7a3a' : undefined;
    if (reqNumber) reqNumber.style.color = rules.number ? '#2d7a3a' : undefined;
    if (reqSpecial) reqSpecial.style.color = rules.special ? '#2d7a3a' : undefined;
  }, [newPass]);

  const handleInitTwoFactor = async () => {
    try {
      const res = await fetch('/api/auth/2fa/iniciar', { method: 'POST' });
      if (!res.ok) throw new Error('No se pudo iniciar la configuración.');
      const data = await res.json();
      setTwoFactorSetup(data);
      document.getElementById('twoFactorSetupBox').style.display = 'block';
    } catch (err) {
      alert(err.message || 'Error al iniciar la configuración de 2FA.');
    }
  };

  const handleEnableTwoFactor = async () => {
    try {
      const res = await fetch('/api/auth/2fa/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: tfCode }),
      });
      if (!res.ok) throw new Error('Código inválido o expirado.');
      setTwoFactorSetup(null);
      setTfCode('');
      await loadTwoFactorStatus();
      document.getElementById('twoFactorSetupBox').style.display = 'none';
    } catch (err) {
      alert(err.message || 'Error al activar el doble factor.');
    }
  };

  const handleDisableTwoFactor = async () => {
    const code = window.prompt('Ingresa el código actual de tu app para desactivar 2FA:');
    if (!code) return;
    try {
      const res = await fetch('/api/auth/2fa/desactivar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: code }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'No se pudo desactivar.');
      }
      await loadTwoFactorStatus();
    } catch (err) {
      alert(err.message || 'Error al desactivar el doble factor.');
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-user">
          <div
            className="avatar avatar-green"
            id="sidebarUserAvatar"
            style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}
          >
            {getInitials(nombre || user?.nombre)}
          </div>
          <div className="sidebar-user-info">
            <span className="name" id="sidebarUserName">
              {nombre || user?.nombre || 'Cargando...'}
            </span>
            <span className="role" id="sidebarUserRole">
              {user?.rol || 'Usuario'}
            </span>
          </div>
        </div>

        <div className="sidebar-label">Navegación</div>
        <Link to={getDashboardLink(user?.rol)} id="backToDashboardBtn" className="sidebar-link">
          <span className="icon">📊</span> Volver al Panel
        </Link>
        <a href="#" className="sidebar-link active">
          <span className="icon">👤</span> Mi Perfil
        </a>

        <a
          href="#"
          onClick={handleLogout}
          className="sidebar-link"
          style={{ marginTop: 'auto', color: 'var(--red)' }}
        >
          <span className="icon">🔒</span> Cerrar sesión
        </a>
      </aside>

      <main className="main-content">
        <div className="profile-container">
          <div className="dash-header">
            <div>
              <h1>Configuración de Perfil</h1>
              <p>Gestiona tu información personal y la seguridad de tu cuenta.</p>
            </div>
          </div>

          <div className="profile-grid">
            <div className="profile-card">
              <h3 className="card-title">Información Personal</h3>

              <div id="profileAlert" className="alert-box" style={{ display: 'none' }} />

              <form id="profileForm" novalidate onSubmit={handleSaveProfile}>
                <div className="avatar-upload-section">
                  <div className="avatar-preview-container">
                    <img
                      id="avatarPreview"
                      src={avatarSrc || 'https://placehold.co/150x150/e8f5e9/1a5c2a?text=Foto'}
                      alt="Foto de perfil"
                      className="profile-avatar-img"
                    />
                    <div
                      className="avatar-loading-overlay"
                      id="avatarLoading"
                      style={{ display: 'none' }}
                    >
                      <div className="spinner" />
                    </div>
                  </div>
                  <div className="avatar-upload-controls">
                    <label htmlFor="avatarInput" className="btn btn-secondary btn-sm">
                      Seleccionar Foto
                    </label>
                    <input
                      type="file"
                      id="avatarInput"
                      ref={fileRef}
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      style={{ display: 'none' }}
                      onChange={handleAvatarChange}
                    />
                    <span className="form-help">PNG, JPG o WEBP (máx. 5MB)</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="nombre">Nombre Completo</label>
                  <input className="form-input" id="nombre" type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                  <span className="form-error" id="nombreError">El nombre es requerido.</span>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="correo">Correo Electrónico (No editable)</label>
                  <input className="form-input" id="correo" type="email" disabled value={correo} style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }} />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="telefono">Teléfono</label>
                  <input className="form-input" id="telefono" type="tel" placeholder="Ej. 3001234567" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
                  <span className="form-error" id="telefonoError">Ingresa un teléfono válido.</span>
                </div>

                <button className="btn btn-primary" id="saveProfileBtn" type="submit" style={{ width: '100%', marginTop: '12px' }}>
                  Guardar Cambios
                </button>
              </form>
            </div>

            <div className="profile-card">
              <h3 className="card-title">Seguridad y Contraseña</h3>

              <div id="passwordAlert" className="alert-box" style={{ display: 'none' }} />

              <form id="passwordForm" novalidate onSubmit={handleSavePassword}>
                <div className="form-group">
                  <label className="form-label" htmlFor="currentPassword">Contraseña Actual</label>
                  <input className="form-input" id="currentPassword" type="password" placeholder="••••••••" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} required />
                  <span className="form-error" id="currentPasswordError">La contraseña actual es requerida.</span>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="newPassword">Nueva Contraseña</label>
                  <input className="form-input" id="newPassword" type="password" placeholder="••••••••" value={newPass} onChange={(e) => setNewPass(e.target.value)} required />

                  <div className="strength-card" style={{ marginTop: '8px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <span
                        className="form-label"
                        style={{ margin: 0, fontSize: '0.8rem' }}
                      >
                        Fortaleza
                      </span>
                      <span
                        id="strengthLabel"
                        style={{
                          fontWeight: 700,
                          color: '#dc2626',
                          fontSize: '0.8rem',
                        }}
                      >
                        {strength.label}
                      </span>
                    </div>
                    <div
                      className="strength-bar-track"
                      style={{
                        height: '6px',
                        background: '#e5e7eb',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        marginTop: '6px',
                      }}
                    >
                      <div
                        id="strengthBar"
                        className="strength-bar"
                        style={{
                          width: `${strength.pct}%`,
                          height: '100%',
                          background: '#dc2626',
                          transition: 'width 0.2s',
                        }}
                      />
                    </div>
                    <div
                      className="strength-requirements"
                      style={{
                        display: 'grid',
                        gap: '4px',
                        marginTop: '8px',
                        fontSize: '0.75rem',
                        color: '#6b7280',
                      }}
                    >
                      <div id="reqLength">• Mínimo 8 caracteres</div>
                      <div id="reqUpper">• Una mayúscula</div>
                      <div id="reqNumber">• Un número</div>
                      <div id="reqSpecial">• Un carácter especial</div>
                    </div>
                  </div>
                  <span className="form-error" id="newPasswordError">Cumple con todos los requisitos.</span>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                  <input className="form-input" id="confirmPassword" type="password" placeholder="••••••••" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} required />
                  <span className="form-error" id="confirmPasswordError">Las contraseñas no coinciden.</span>
                </div>

                <button className="btn btn-primary" id="savePasswordBtn" type="submit" style={{ width: '100%', marginTop: '12px' }}>
                  Actualizar Contraseña
                </button>
              </form>

              <hr style={{ margin: '24px 0', border: 0, borderTop: '1px solid #eef2f7' }} />

              <h3 className="card-title" style={{ marginBottom: '10px' }}>
                Autenticación en dos pasos
              </h3>
              <p className="form-help" style={{ marginBottom: '12px' }}>
                Protege tu cuenta con Google Authenticator o Microsoft Authenticator.
              </p>

              <div
                id="twoFactorStatus"
                className="alert-box info"
                style={{
                  display: 'block',
                  marginBottom: '12px',
                }}
              >
                Estado: {twoFactorEnabled ? 'configurado' : 'no configurado'}
              </div>

              <div
                id="twoFactorSetupBox"
                className="twofa-box"
                style={{ display: twoFactorSetup ? 'block' : 'none' }}
                hidden={!twoFactorSetup}
              >
                <div className="form-group">
                  <label className="form-label" htmlFor="twoFactorSecret">Clave manual</label>
                  <input className="form-input" id="twoFactorSecret" type="text" readOnly value={twoFactorSetup?.secret || ''} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="twoFactorOtpUrl">URL OTPAUTH</label>
                  <input className="form-input" id="twoFactorOtpUrl" type="text" readOnly value={twoFactorSetup?.otpauthUrl || ''} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="twoFactorCode">Código de Authenticator</label>
                  <input className="form-input" id="twoFactorCode" type="text" maxLength={6} placeholder="123456" inputMode="numeric" value={tfCode} onChange={(e) => setTfCode(e.target.value)} />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  marginTop: '8px',
                }}
              >
                <button className="btn btn-secondary" id="btnInit2FA" type="button" onClick={handleInitTwoFactor}>
                  Configurar Authenticator
                </button>
                <button
                  className="btn btn-primary"
                  id="btnEnable2FA"
                  type="button"
                  style={{ display: twoFactorSetup ? 'inline-flex' : 'none' }}
                  onClick={handleEnableTwoFactor}
                >
                  Activar 2FA
                </button>
                <button
                  className="btn btn-danger"
                  id="btnDisable2FA"
                  type="button"
                  style={{ display: twoFactorEnabled && !twoFactorSetup ? 'inline-flex' : 'none' }}
                  onClick={handleDisableTwoFactor}
                >
                  Desactivar 2FA
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
