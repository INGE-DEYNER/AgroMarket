// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import LanguageSwitcher from './LanguageSwitcher';
import DivisaSwitcher from './DivisaSwitcher';
import CartDrawer from './CartDrawer';
import api from '../utils/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count: totalItems, cartOpen, setCartOpen } = useCart();
  const { t } = useTranslation();
  const [busqueda, setBusqueda] = useState('');
  const [menuUsuario, setMenuUsuario] = useState(false);
  const [menuCategorias, setMenuCategorias] = useState(false);
  const [menuMovil, setMenuMovil] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [animateBadge, setAnimateBadge] = useState(false);
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);
  const userMenuRef = useRef(null);
  const categoriesMenuRef = useRef(null);
  const prevItemsRef = useRef(totalItems);
  const [categorias, setCategorias] = useState([
    'Banano', 'Mango', 'Piña', 'Maracuyá', 'Guanábana', 
    'Naranja', 'Coco', 'Limón', 'Otro'
  ]);

  useEffect(() => {
    let active = true;
    const fetchCats = async () => {
      try {
        const res = await api.get('/productos/categorias');
        const data = res.data || res;
        if (Array.isArray(data) && active) {
          const map = {
            BANANO: 'Banano',
            MANGO: 'Mango',
            PINA: 'Piña',
            MARACUYA: 'Maracuyá',
            GUANABANA: 'Guanábana',
            NARANJA: 'Naranja',
            COCO: 'Coco',
            LIMON: 'Limón',
            OTRO: 'Otro'
          };
          const formatted = data.map(c => map[c] || (c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()));
          setCategorias(formatted);
        }
      } catch (err) {
        console.error('Error fetching real categories:', err);
      }
    };
    fetchCats();
    return () => { active = false; };
  }, []);

  // Glassmorphism on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Animación del badge al agregar productos
  useEffect(() => {
    if (totalItems > prevItemsRef.current) {
      setAnimateBadge(true);
      const timer = setTimeout(() => setAnimateBadge(false), 500);
      return () => clearTimeout(timer);
    }
    prevItemsRef.current = totalItems;
  }, [totalItems]);

  // Cierra dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setMenuUsuario(false);
      }
      if (categoriesMenuRef.current && !categoriesMenuRef.current.contains(e.target)) {
        setMenuCategorias(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <header className={`navbar-header${scrolled ? ' scrolled' : ''}`}>
      {/* Barra superior */}
      <div className="navbar-top">
        <Link to="/home" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/logo-asafrut.jpg"
            alt="ASAFRUT Logo"
            style={{ height: '40px', width: '40px', objectFit: 'contain', borderRadius: '8px' }}
            loading="eager"
          />
          <span>AgroMarket</span>
        </Link>

        {/* Barra de búsqueda central */}
        <form className="nav-search" onSubmit={handleBusqueda}>
          <input
            type="text"
            value={busqueda}
            onChange={handleSearchChange}
            placeholder={t('nav.searchPlaceholder', 'Buscar frutas, verduras, productores...')}
            aria-label="Buscar productos"
          />
          <button type="submit" className="nav-search-btn" aria-label="Buscar">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
        </form>

        {/* Acciones derechas */}
        <div className="nav-actions">
          <LanguageSwitcher />
          <DivisaSwitcher />
          
          {/* Botón Carrito que abre el Drawer */}
          {(!user || (user.role?.toLowerCase() !== 'productor' && user.role?.toLowerCase() !== 'admin')) && (
            <button 
              type="button" 
              onClick={() => setCartOpen(true)} 
              className="nav-icon-btn" 
              title="Carrito" 
              aria-label="Ver carrito"
            >
              <CartIcon />
              {totalItems > 0 && (
                <span className={`nav-badge ${animateBadge ? 'badge-bounce' : ''}`}>
                  {totalItems}
                </span>
              )}
            </button>
          )}

          {!user ? (
            <>
              <Link to="/login" className="nav-btn-text">{t('nav.login', 'Iniciar sesión')}</Link>
              <Link to="/registro" className="nav-btn-primary">{t('nav.register', 'Registrarse')}</Link>
            </>
          ) : (
            <>
              <Link to="/mensajeria" className="nav-icon-btn" title="Mensajes" aria-label="Mensajes">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              </Link>

              {/* Usuario dropdown */}
              <div className="nav-user" ref={userMenuRef} onClick={() => setMenuUsuario(!menuUsuario)}>
                <div className="nav-avatar">
                  {user.fotoUrl
                    ? <img src={user.fotoUrl} alt={user.nombre} loading="lazy" />
                    : <span>{(user.nombre || 'U').charAt(0).toUpperCase()}</span>
                  }
                </div>
                <span className="nav-username" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {user.nombre}
                  {user.role?.toLowerCase() === 'admin' && (
                    <span className="admin-badge" style={{
                      backgroundColor: '#f4a261',
                      color: 'white',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Admin
                    </span>
                  )}
                </span>
                <svg
                  viewBox="0 0 24 24" width="14" height="14" fill="currentColor"
                  className="nav-arrow"
                  style={{
                    transition: 'transform 0.2s ease',
                    transform: menuUsuario ? 'rotate(180deg)' : 'rotate(0)',
                  }}
                >
                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                </svg>

                {menuUsuario && (
                  <div className="nav-dropdown">
                    {/* COMPRADOR */}
                    {(user.role?.toLowerCase() === 'comprador' || user.role?.toLowerCase() === 'comprador_empresa') && (
                      <>
                        <Link to="/dashboard-comprador" onClick={() => setMenuUsuario(false)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
                          Mi dashboard
                        </Link>
                        <Link to="/pedidos" onClick={() => setMenuUsuario(false)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>
                          Mis pedidos
                        </Link>
                        <Link to="/dashboard-comprador?tab=favoritos" onClick={() => setMenuUsuario(false)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                          Favoritos
                        </Link>
                        <Link to="/mensajeria" onClick={() => setMenuUsuario(false)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                          Mensajes
                        </Link>
                        <Link to="/perfil" onClick={() => setMenuUsuario(false)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                          Mi perfil
                        </Link>
                      </>
                    )}

                    {/* PRODUCTOR */}
                    {user.role?.toLowerCase() === 'productor' && (
                      <>
                        <Link to="/dashboard-comprador" onClick={() => setMenuUsuario(false)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
                          Mi dashboard
                        </Link>
                        <Link to="/dashboard-productor" onClick={() => setMenuUsuario(false)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/></svg>
                          Panel productor
                        </Link>
                        <Link to="/pedidos" onClick={() => setMenuUsuario(false)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>
                          Mis pedidos
                        </Link>
                        <Link to="/mensajeria" onClick={() => setMenuUsuario(false)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                          Mensajes
                        </Link>
                        <Link to="/perfil" onClick={() => setMenuUsuario(false)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                          Mi perfil
                        </Link>
                      </>
                    )}

                    {/* ADMIN */}
                    {user.role?.toLowerCase() === 'admin' && (
                      <>
                        <Link to="/admin" onClick={() => setMenuUsuario(false)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 3.99L19.53 19H4.47L12 5.99zM13 16h-2v2h2v-2zm0-6h-2v4h2v-4z"/></svg>
                          Panel admin
                        </Link>
                        <Link to="/dashboard-comprador" onClick={() => setMenuUsuario(false)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
                          Mi dashboard (compras)
                        </Link>
                        <Link to="/dashboard-productor" onClick={() => setMenuUsuario(false)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/></svg>
                          Panel productor
                        </Link>
                        <Link to="/pedidos" onClick={() => setMenuUsuario(false)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>
                          Mis pedidos
                        </Link>
                        <Link to="/mensajeria" onClick={() => setMenuUsuario(false)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                          Mensajes
                        </Link>
                        <Link to="/perfil" onClick={() => setMenuUsuario(false)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                          Mi perfil
                        </Link>
                      </>
                    )}
                    <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                    <button onClick={handleLogout} className="nav-logout">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                      </svg>
                      {t('nav.logout', 'Cerrar sesión')}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Hamburguesa móvil */}
        <button className={`nav-hamburger ${menuMovil ? 'active' : ''}`} onClick={() => setMenuMovil(!menuMovil)} aria-label="Abrir menú">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Barra de categorías (desktop) */}
      <nav className="navbar-categories" aria-label="Categorías">
        <div className="nav-cats-inner">
          <div style={{ position: 'relative' }} ref={categoriesMenuRef}>
            <button 
              onClick={() => setMenuCategorias(!menuCategorias)}
              className="nav-cats-btn"
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '4px 8px',
                fontSize: 'inherit'
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ marginRight: '4px' }}>
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
              Categorías
            </button>
            {menuCategorias && (
              <div className="categories-dropdown" style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                backgroundColor: 'white',
                minWidth: '180px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                padding: '8px 0',
                border: '1px solid #e5e7eb',
                marginTop: '4px'
              }}>
                <style>{`
                  .category-item-link:hover {
                    background-color: #f3f4f6;
                    color: #385723 !important;
                  }
                `}</style>
                 {categorias.map((cat) => (
                  <Link 
                    key={cat} 
                    to={`/catalogo?categoria=${encodeURIComponent(cat)}`}
                    onClick={() => setMenuCategorias(false)}
                    style={{
                      padding: '8px 16px',
                      color: '#374151',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      display: 'block',
                      transition: 'background-color 0.2s'
                    }}
                    className="category-item-link"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link to="/catalogo?sort=masVendidos">{t('nav.trending', 'Más vendidos')}</Link>
          <Link to="/catalogo?enPromocion=true">{t('nav.deals', 'Ofertas')}</Link>
          <Link to="/productores">{t('nav.producers', 'Productores')}</Link>
          <Link to="/como-funciona">{t('nav.howItWorks', 'Cómo funciona')}</Link>
          {user?.role?.toLowerCase() === 'admin' && <Link to="/admin">{t('nav.admin', 'Admin')}</Link>}
        </div>
      </nav>

      {/* Drawer móvil izquierda */}
      <div 
        className={`mobile-drawer-overlay ${menuMovil ? 'open' : ''}`} 
        onClick={() => setMenuMovil(false)} 
      />
      <div className={`mobile-drawer ${menuMovil ? 'open' : ''}`} role="navigation" aria-label="Menú móvil">
        <div className="mobile-drawer-header">
          <Link to="/home" className="nav-logo" onClick={() => setMenuMovil(false)}>
            <img
              src="/logo-asafrut.jpg"
              alt="ASAFRUT Logo"
              style={{ height: '36px', width: '36px', objectFit: 'contain', borderRadius: '8px' }}
            />
            <span>AgroMarket</span>
          </Link>
          <button className="mobile-drawer-close" onClick={() => setMenuMovil(false)} aria-label="Cerrar menú">✕</button>
        </div>

        <div className="mobile-drawer-links">
          <Link to="/catalogo" onClick={() => setMenuMovil(false)}>{t('nav.catalog', 'Catálogo')}</Link>
          <Link to="/productores" onClick={() => setMenuMovil(false)}>{t('nav.producers', 'Productores')}</Link>
          <Link to="/home#como-funciona" onClick={() => setMenuMovil(false)}>{t('nav.howItWorks', 'Cómo funciona')}</Link>
          {user?.role?.toLowerCase() === 'admin' && (
            <Link to="/admin" onClick={() => setMenuMovil(false)}>{t('nav.admin', 'Admin')}</Link>
          )}
          
          <hr className="mobile-drawer-divider" />
          
          {!user ? (
            <div className="mobile-drawer-auth">
              <Link to="/login" className="mobile-drawer-btn-text" onClick={() => setMenuMovil(false)}>
                {t('nav.login', 'Iniciar sesión')}
              </Link>
              <Link to="/registro" className="mobile-drawer-btn-primary" onClick={() => setMenuMovil(false)}>
                {t('nav.register', 'Registrarse')}
              </Link>
            </div>
          ) : (
            <div className="mobile-drawer-user">
              <div className="user-profile-summary">
                <div className="nav-avatar">
                  {user.fotoUrl ? (
                    <img src={user.fotoUrl} alt={user.nombre} />
                  ) : (
                    <span>{(user.nombre || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.nombre}</div>
                  <div className="user-role">{user.role}</div>
                </div>
              </div>
              
              {/* Para Comprador / Empresa */}
              {(user.role?.toLowerCase() === 'comprador' || user.role?.toLowerCase() === 'comprador_empresa') && (
                <>
                  <Link to="/dashboard-comprador" onClick={() => setMenuMovil(false)}>Mi dashboard</Link>
                  <Link to="/pedidos" onClick={() => setMenuMovil(false)}>Mis pedidos</Link>
                  <Link to="/dashboard-comprador?tab=favoritos" onClick={() => setMenuMovil(false)}>Favoritos</Link>
                  <Link to="/mensajeria" onClick={() => setMenuMovil(false)}>Mensajes</Link>
                  <Link to="/perfil" onClick={() => setMenuMovil(false)}>Mi perfil</Link>
                </>
              )}

              {/* Para Productor */}
              {user.role?.toLowerCase() === 'productor' && (
                <>
                  <Link to="/dashboard-comprador" onClick={() => setMenuMovil(false)}>Mi dashboard</Link>
                  <Link to="/dashboard-productor" onClick={() => setMenuMovil(false)}>Panel productor</Link>
                  <Link to="/pedidos" onClick={() => setMenuMovil(false)}>Mis pedidos</Link>
                  <Link to="/mensajeria" onClick={() => setMenuMovil(false)}>Mensajes</Link>
                  <Link to="/perfil" onClick={() => setMenuMovil(false)}>Mi perfil</Link>
                </>
              )}

              {/* Para Admin */}
              {user.role?.toLowerCase() === 'admin' && (
                <>
                  <Link to="/admin" onClick={() => setMenuMovil(false)}>Panel admin</Link>
                  <Link to="/dashboard-comprador" onClick={() => setMenuMovil(false)}>Mi dashboard (compras)</Link>
                  <Link to="/dashboard-productor" onClick={() => setMenuMovil(false)}>Panel productor</Link>
                  <Link to="/pedidos" onClick={() => setMenuMovil(false)}>Mis pedidos</Link>
                  <Link to="/mensajeria" onClick={() => setMenuMovil(false)}>Mensajes</Link>
                  <Link to="/perfil" onClick={() => setMenuMovil(false)}>Mi perfil</Link>
                </>
              )}
              
              <button onClick={() => { handleLogout(); setMenuMovil(false); }} className="nav-logout-mobile">
                {t('nav.logout', 'Cerrar sesión')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cart Drawer deslizable desde la derecha */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 5.9 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0023.45 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>
  );
}
