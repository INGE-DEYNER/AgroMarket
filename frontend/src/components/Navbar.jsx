import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { normalizarRol } from '../utils/auth.js';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import '../styles/styles.css';
import '../styles/home.css';

export default function Navbar() {
  const { t } = useTranslation();
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
    if (r === 'admin') return '/admin';
    if (r === 'productor') return '/dashboard-productor';
    if (r === 'comprador') return '/dashboard-comprador';
    return '/';
  };

  const getNavLinks = (rol) => {
    const r = normalizarRol(rol);
    if (r === 'comprador') {
      return [
        { href: '/dashboard-comprador', label: t('nav.myPanel') },
        { href: '/catalogo', label: t('nav.catalogo') },
        { href: '/pedidos', label: t('dashboard.misOrdenes') },
        { href: '/mensajeria', label: t('nav.messages') },
      ];
    } else if (r === 'productor') {
      return [
        { href: '/dashboard-productor', label: t('nav.myPanel') },
        { href: '/mensajeria', label: t('nav.messages') },
      ];
    } else if (r === 'admin') {
      return [
        { href: '/admin', label: t('nav.myPanel') },
        { href: '/admin', label: t('nav.users') },
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
    const handleEsc = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const dashboardLink = user ? getDashboardLink(user.rol) : '/';
  const navLinks = user ? getNavLinks(user.rol) : [];

  return (
    <nav className={`navbar${menuOpen ? ' menu-open' : ''}`} id="navbar">
      <Link to="/" className="nav-brand">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z" />
        </svg>
        <span>{t('general.appName')}</span>
      </Link>

      <div className="nav-links" id="navLinks">
        {!isAuthenticated ? (
          <>
            <Link to="/">{t('nav.inicio')}</Link>
            <Link to="/catalogo">{t('nav.catalogo')}</Link>
            <Link to="#como-funciona">Cómo funciona</Link>
          </>
        ) : (
          navLinks.map((link) => (
            <Link key={link.href + link.label} to={link.href}>
              {link.label}
            </Link>
          ))
        )}
      </div>

      <div className="nav-actions" id="navActions">
        <LanguageSwitcher />
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="btn btn-secondary">{t('auth.iniciarSesion')}</Link>
            <Link to="/registro" className="btn btn-primary">{t('auth.registrarse')}</Link>
          </>
        ) : (
          <>
            <span className="nav-user-greeting">
              {t('nav.hello')}, {user?.nombre?.split(' ')[0] || t('general.user')}
            </span>
            <Link to={dashboardLink} className="btn btn-secondary btn-sm">
              {t('nav.myPanel')}
            </Link>
            <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                style={{
                  width: '40px', height: '40px', borderRadius: '999px',
                  border: '1px solid rgba(45,106,79,.2)',
                  background: '#fff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', overflow: 'hidden',
                  cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,.08)',
                }}
              >
                {user?.fotoPerfil ? (
                  <img
                    src={user.fotoPerfil}
                    alt={t('general.photoOf', { name: user.nombre || t('general.user') })}
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
                    <div style={{ fontWeight: 700, color: '#1a3a2a' }}>{user?.nombre || t('general.user')}</div>
                    <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '4px' }}>
                      {user?.rol || t('general.buyer')}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: '6px' }}>
                    <Link to={dashboardLink} style={{ padding: '10px 12px', borderRadius: '12px', textDecoration: 'none', color: '#1a3a2a', fontWeight: 700, display: 'block' }}>
                      {t('nav.viewPanel')}
                    </Link>
                    <Link to="/perfil" style={{ padding: '10px 12px', borderRadius: '12px', textDecoration: 'none', color: '#1a3a2a', fontWeight: 500, display: 'block' }}>
                      {t('nav.myProfile')}
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => { logout(); setMenuOpen(false); }}
                    style={{
                      marginTop: '6px', width: '100%', padding: '10px 12px',
                      borderRadius: '12px', border: 0, background: '#fef2f2',
                      color: '#991b1b', fontWeight: 700, cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    {t('nav.cerrarSesion')}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <button className="menu-toggle" id="menuToggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>
    </nav>
  );
}
