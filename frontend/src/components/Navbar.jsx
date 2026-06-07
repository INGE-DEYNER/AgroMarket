// File: frontend/src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { escapeHtml } from '../utils/ui.js';
import { normalizarRol } from '../utils/auth.js';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const getInitials = (nombre = '') => {
    return String(nombre)
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const getDashboardLink = (rol) => {
    const r = normalizarRol(rol);
    if (r === 'admin') return '/admin.html';
    if (r === 'productor') return '/dashboard-productor.html';
    if (r === 'comprador') return '/dashboard-comprador.html';
    return '/home.html';
  };

  const getNavLinks = (rol) => {
    const r = normalizarRol(rol);
    if (r === 'comprador') {
      return [
        { href: '/dashboard-comprador.html', label: 'Mi Panel' },
        { href: '/catalogo.html', label: 'Catálogo' },
        { href: '/pedidos.html', label: 'Mis Pedidos' },
        { href: '/mensajeria.html', label: 'Mensajes' },
      ];
    } else if (r === 'productor') {
      return [
        { href: '/dashboard-productor.html', label: 'Mi Panel' },
        { href: '/mensajeria.html', label: 'Mensajes' },
      ];
    } else if (r === 'admin') {
      return [
        { href: '/admin.html', label: 'Mi Panel' },
        { href: '/admin.html', label: 'Usuarios' },
      ];
    }
    return [];
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const dashboardLink = user ? getDashboardLink(user.rol) : '/home.html';
  const navLinks = user ? getNavLinks(user.rol) : [];

  return (
    <nav id="main-nav" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: '64px',
      background: '#fff',
      borderBottom: '1px solid rgba(45,106,79,0.12)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <a href="/home.html" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'linear-gradient(135deg,#2d6a4f,#40916c)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff">
            <path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z" />
          </svg>
        </div>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1a3a2a' }}>AgroMarket</span>
      </a>

      {/* Nav Links */}
      {isAuthenticated && (
        <div style={{ display: 'flex', gap: '4px', id: 'navLinks' }}>
          {navLinks.map((link) => (
            <a
              key={link.href + link.label}
              href={link.href}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#2d6a4f',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      {/* Nav Actions */}
      <div id="navActions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {!isAuthenticated ? (
          <>
            <a href="/login.html" className="btn btn-secondary" style={{ padding: '6px 14px' }}>
              Iniciar sesión
            </a>
            <a href="/registro.html" className="btn btn-primary" style={{ padding: '6px 14px' }}>
              Registrarse
            </a>
          </>
        ) : (
          <>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a3a2a' }}>
              Hola, {(user?.nombre || 'Usuario').split(' ')[0]}
            </span>
            <a
              href={dashboardLink}
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 12px', textDecoration: 'none' }}
            >
              Mi Panel
            </a>

            {/* Profile dropdown */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                style={{
                  width: '42px', height: '42px', borderRadius: '999px',
                  border: '1px solid rgba(45,106,79,.2)',
                  background: '#fff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', overflow: 'hidden',
                  cursor: 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,.08)',
                }}
              >
                {user?.fotoPerfil ? (
                  <img
                    src={user.fotoPerfil}
                    alt={`Foto de ${user.nombre || 'usuario'}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '100%', height: '100%',
                    background: 'linear-gradient(135deg,#2d6a4f,#40916c)',
                    color: '#fff', fontWeight: 800, fontSize: '0.8rem',
                  }}>
                    {getInitials(user?.nombre || 'U')}
                  </span>
                )}
              </button>

              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                  minWidth: '220px', background: '#fff',
                  border: '1px solid rgba(45,106,79,.14)',
                  borderRadius: '16px', boxShadow: '0 18px 40px rgba(0,0,0,.12)',
                  padding: '10px', zIndex: 30,
                }}>
                  <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid rgba(45,106,79,.12)', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 700, color: '#1a3a2a' }}>{user?.nombre || 'Usuario'}</div>
                    <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '4px' }}>
                      {user?.rol || 'comprador'}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: '6px' }}>
                    <a href={dashboardLink} style={{ padding: '10px 12px', borderRadius: '12px', textDecoration: 'none', color: '#1a3a2a', fontWeight: 700, display: 'block' }}>
                      Ver panel
                    </a>
                    <a href="/perfil.html" style={{ padding: '10px 12px', borderRadius: '12px', textDecoration: 'none', color: '#1a3a2a', fontWeight: 500, display: 'block' }}>
                      Mi perfil
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => { logout(); }}
                    style={{
                      marginTop: '6px', width: '100%', padding: '10px 12px',
                      borderRadius: '12px', border: 0, background: '#fef2f2',
                      color: '#991b1b', fontWeight: 700, cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
