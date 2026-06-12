import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const role = user?.role?.toLowerCase();

  return (
    <nav className="navbar" id="navbar">
      <Link to="/home" className="navbar-brand">
        <span className="logo-icon">🌿</span>
        <span>AgroMarket</span>
      </Link>

      <div className={`navbar-links${menuOpen ? ' open' : ''}`} id="navLinks">
        {!user ? (
          <>
            <Link to="/home">{t('nav.home', 'Inicio')}</Link>
            <Link to="/catalogo">{t('nav.catalog', 'Catálogo')}</Link>
            <a href="#como-funciona">{t('nav.howItWorks', 'Cómo funciona')}</a>
            <a href="#asafrut">{t('nav.about', 'Sobre ASAFRUT')}</a>
          </>
        ) : (
          <>
            {(role === 'comprador' || role === 'admin') && (
              <Link to="/dashboard-comprador">{t('nav.myPanel', 'Mi Panel')}</Link>
            )}
            {(role === 'productor' || role === 'admin') && (
              <Link to="/dashboard-productor">Panel Productor</Link>
            )}
            <Link to="/catalogo">{t('nav.catalog', 'Catálogo')}</Link>
            <Link to="/pedidos">{t('nav.orders', 'Pedidos')}</Link>
            <Link to="/mensajeria">{t('nav.messages', 'Mensajes')}</Link>
            <Link to="/envios">{t('nav.shipping', 'Envíos')}</Link>
            {role === 'admin' && <Link to="/admin">Admin</Link>}
          </>
        )}
      </div>

      <div className="navbar-right" id="navActions">
        {!user ? (
          <>
            <Link to="/login" className="btn btn-secondary">{t('nav.login', 'Iniciar sesión')}</Link>
            <Link to="/registro" className="btn btn-primary">{t('nav.register', 'Registrarse')}</Link>
          </>
        ) : (
          <>
            <div className="avatar avatar-blue" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
              {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleLogout}
              style={{ cursor: 'pointer' }}
            >
              {t('nav.logout', 'Cerrar sesión')}
            </button>
          </>
        )}
        <LanguageSwitcher />
      </div>

      <button
        className="menu-toggle"
        id="menuToggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>
    </nav>
  );
}
