import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count: totalItems } = useCart();
  const { t } = useTranslation();
  const [busqueda, setBusqueda] = useState('');
  const [menuUsuario, setMenuUsuario] = useState(false);
  const [menuMovil, setMenuMovil] = useState(false);
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);

  const handleBusqueda = (e) => {
    e.preventDefault();
    if (busqueda.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(busqueda)}`);
    } else {
      navigate('/catalogo');
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setBusqueda(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (val.trim()) {
        navigate(`/catalogo?search=${encodeURIComponent(val)}`);
      } else {
        navigate('/catalogo');
      }
    }, 500);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar-header">
      {/* Barra superior */}
      <div className="navbar-top">
        <Link to="/home" className="nav-logo">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="var(--primary)">
            <path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z"/>
          </svg>
          <span>AgroMarket</span>
        </Link>

        {/* Barra de búsqueda central */}
        <form className="nav-search" onSubmit={handleBusqueda}>
          <input
            type="text"
            value={busqueda}
            onChange={handleSearchChange}
            placeholder={t('nav.searchPlaceholder', 'Buscar frutas, verduras, productores...')}
          />
          <button type="submit" className="nav-search-btn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
        </form>

        {/* Acciones derechas */}
        <div className="nav-actions">
          {!user ? (
            <>
              <LanguageSwitcher />
              <Link to="/catalogo" className="nav-icon-btn" title="Carrito">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 5.9 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0023.45 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                {totalItems > 0 && <span className="nav-badge">{totalItems}</span>}
              </Link>
              <Link to="/login" className="nav-btn-text">{t('nav.login', 'Iniciar sesión')}</Link>
              <Link to="/registro" className="nav-btn-primary">{t('nav.register', 'Registrarse')}</Link>
            </>
          ) : (
            <>
              <LanguageSwitcher />
              {/* Carrito */}
              <Link to="/catalogo" className="nav-icon-btn" title="Carrito">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 5.9 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0023.45 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                {totalItems > 0 && <span className="nav-badge">{totalItems}</span>}
              </Link>

              <Link to="/mensajeria" className="nav-icon-btn" title="Mensajes">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                   <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              </Link>

              {/* Usuario dropdown */}
              <div className="nav-user" onClick={() => setMenuUsuario(!menuUsuario)}>
                <div className="nav-avatar">
                  {user.fotoUrl
                    ? <img src={user.fotoUrl} alt={user.nombre} loading="lazy" />
                    : <span>{(user.nombre || 'U').charAt(0).toUpperCase()}</span>
                  }
                </div>
                <span className="nav-username">{user.nombre}</span>
                <span className="nav-arrow">▼</span>

                {menuUsuario && (
                  <div className="nav-dropdown">
                    <Link to="/perfil">{t('nav.myAccount', 'Mi cuenta')}</Link>
                    <Link to={user.role?.toLowerCase() === 'productor' ? '/dashboard-productor' : '/dashboard-comprador'}>
                      {t('nav.myPanel', 'Mi panel')}
                    </Link>
                    <Link to="/pedidos">{t('nav.myOrders', 'Mis pedidos')}</Link>
                    <Link to="/perfil">{t('nav.coupons', 'Mis cupones')}</Link>
                    <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                    <button onClick={handleLogout} className="nav-logout">
                      {t('nav.logout', 'Cerrar sesión')}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Hamburguesa móvil */}
        <button className="nav-hamburger" onClick={() => setMenuMovil(!menuMovil)}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
      </div>

      {/* Barra de categorías */}
      <nav className="navbar-categories">
        <div className="nav-cats-inner">
          <Link to="/catalogo" style={{ fontWeight: 'bold' }}>≡ Categorías</Link>
          <Link to="/catalogo?sort=masVendidos">{t('nav.trending', 'Más vendidos')}</Link>
          <Link to="/catalogo?enPromocion=true">{t('nav.deals', 'Ofertas')}</Link>
          <Link to="/catalogo">{t('nav.producers', 'Productores')}</Link>
          <Link to="/home#como-funciona">{t('nav.howItWorks', 'Cómo funciona')}</Link>
          {user?.role?.toLowerCase() === 'admin' && <Link to="/admin">{t('nav.admin', 'Admin')}</Link>}
        </div>
      </nav>

      {/* Menú móvil */}
      {menuMovil && (
        <div className="nav-mobile-menu">
          <Link to="/catalogo" onClick={() => setMenuMovil(false)}>Catálogo</Link>
          <Link to="/home#como-funciona" onClick={() => setMenuMovil(false)}>Cómo funciona</Link>
          {!user ? (
            <>
              <Link to="/login" onClick={() => setMenuMovil(false)}>Iniciar sesión</Link>
              <Link to="/registro" onClick={() => setMenuMovil(false)}>Registrarse</Link>
            </>
          ) : (
            <>
               <Link to="/perfil" onClick={() => setMenuMovil(false)}>Mi Perfil</Link>
               <Link to={user.role?.toLowerCase() === 'productor' ? '/dashboard-productor' : '/dashboard-comprador'} onClick={() => setMenuMovil(false)}>Mi Panel</Link>
               <button onClick={() => { handleLogout(); setMenuMovil(false); }} className="nav-logout" style={{ textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', width: '100%', fontSize: '1rem', color: '#ef4444' }}>Cerrar sesión</button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
