import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/styles.css';

function DashboardComprador() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('resumen');
  const [modalFactura, setModalFactura] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    );
  }, []);

  const showSection = (section) => {
    setActiveSection(section);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  const closeModal = () => {
    setModalFactura(false);
  };

  const userName = user?.nombre || 'Usuario';
  const userRole = user?.rol || 'Comprador';
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-user">
          <div
            className="avatar avatar-blue"
            id="sidebarUserAvatar"
            style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}
          >
            {userInitials}
          </div>
          <div className="sidebar-user-info">
            <span className="name" id="sidebarUserName">{userName}</span>
            <span className="role" id="sidebarUserRole">{userRole}</span>
          </div>
        </div>

        <div className="sidebar-label">Navegación</div>
        <Link
          to="#"
          className={`sidebar-link ${activeSection === 'resumen' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); showSection('resumen'); }}
        >
          <span className="icon">📊</span> Resumen
        </Link>
        <Link to="/catalogo" className="sidebar-link">
          <span className="icon">🛍️</span> Explorar Catálogo
        </Link>
        <Link
          to="#"
          className={`sidebar-link ${activeSection === 'misPedidos' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); showSection('misPedidos'); }}
        >
          <span className="icon">🧾</span> Mis Pedidos
        </Link>

        <div className="sidebar-divider"></div>

        <div className="sidebar-label">Servicios</div>
        <Link to="/envios" className="sidebar-link">
          <span className="icon">🚚</span> Seguimiento
        </Link>
        <Link to="/mensajeria" className="sidebar-link">
          <span className="icon">💬</span> Mensajería
        </Link>
        <Link to="/resenas" className="sidebar-link">
          <span className="icon">⭐</span> Mis Reseñas
        </Link>

        <Link
          to="#"
          className="sidebar-link"
          onClick={handleLogout}
          style={{ marginTop: 'auto', color: 'var(--red)' }}
        >
          <span className="icon">🔒</span> Cerrar sesión
        </Link>
      </aside>

      {/* MOBILE NAV */}
      <nav className="mobile-nav">
        <Link
          to="#"
          className={`mobile-nav-item ${activeSection === 'resumen' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); showSection('resumen'); }}
        >
          <span className="icon">🏠</span><span>Inicio</span>
        </Link>
        <Link to="/catalogo" className="mobile-nav-item">
          <span className="icon">🛍️</span><span>Tienda</span>
        </Link>
        <Link
          to="#"
          className={`mobile-nav-item ${activeSection === 'misPedidos' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); showSection('misPedidos'); }}
        >
          <span className="icon">🧾</span><span>Pedidos</span>
        </Link>
        <Link to="/mensajeria" className="mobile-nav-item">
          <span className="icon">💬</span><span>Chat</span>
        </Link>
        <Link
          to="#"
          className="mobile-nav-item"
          onClick={handleLogout}
        >
          <span className="icon">👤</span><span>Salir</span>
        </Link>
      </nav>

      <main className="main-content">
        {/* ── RESUMEN ── */}
        <div className={`section ${activeSection === 'resumen' ? 'active' : ''}`} id="sec-resumen">
          <div className="dash-header">
            <div className="dash-welcome">
              <h1 id="welcomeUserText">¡Hola, {userName}!</h1>
              <p id="currentDate">{currentDate}</p>
            </div>
            <Link to="/catalogo" className="btn-cta"> Explorar catálogo → </Link>
          </div>

          <div className="stats-grid">
            <div className="stat-card color-1">
              <span className="stat-icon-lg">📦</span>
              <div className="stat-label">Pedidos Realizados</div>
              <div className="stat-value" id="statPedidos">--</div>
              <div className="stat-trend up" id="pedidosTrend">Compras totales</div>
              <div className="stat-progress">
                <div className="stat-progress-bar" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div className="stat-card color-2">
              <span className="stat-icon-lg">💰</span>
              <div className="stat-label">Inversión Total</div>
              <div className="stat-value" id="statInversion">--</div>
              <div className="stat-trend up" id="inversionTrend">
                COP invertidos
              </div>
              <div className="stat-progress">
                <div
                  className="stat-progress-bar"
                  style={{ width: '100%', background: 'var(--blue)' }}
                ></div>
              </div>
            </div>
            <div className="stat-card color-3">
              <span className="stat-icon-lg">⭐</span>
              <div className="stat-label">Reseñas Dejadas</div>
              <div className="stat-value" id="statResenas">--</div>
              <div className="stat-trend" id="resenasTrend">Nivel de opinión</div>
              <div className="stat-progress">
                <div
                  className="stat-progress-bar"
                  style={{ width: '100%', background: 'var(--gold)' }}
                ></div>
              </div>
            </div>
            <div className="stat-card color-4">
              <span className="stat-icon-lg">🤝</span>
              <div className="stat-label">Productores</div>
              <div className="stat-value" id="statContactos">--</div>
              <div className="stat-trend up" id="contactosTrend">
                Contactos de chat
              </div>
              <div className="stat-progress">
                <div
                  className="stat-progress-bar"
                  style={{ width: '100%', background: '#a855f7' }}
                ></div>
              </div>
            </div>
          </div>

          {/* TABLA RECIENTES */}
          <div className="card-table" style={{ marginBottom: '32px' }}>
            <div className="table-header">
              <h3 className="card-title">📦 Pedidos Recientes</h3>
              <Link
                to="#"
                style={{ fontSize: '0.8rem', fontWeight: '600' }}
                onClick={(e) => { e.preventDefault(); showSection('misPedidos'); }}
              >
                Ver todos los pedidos
              </Link>
            </div>
            <div className="table-wrap">
              <table className="table-responsive">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Total COP</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody id="tbRecentPedidos"></tbody>
              </table>
            </div>
          </div>

          {/* RECOMENDADOS */}
          <div className="dash-header" style={{ marginBottom: '20px' }}>
            <h3 className="card-title">
              🌟 Productos de Temporada en
              <span data-site="siteRegion">Urabá</span>
            </h3>
          </div>
          <div className="products-grid" id="recsGrid">
            {/* Se llena con JS */}
          </div>
        </div>

        {/* ── MIS PEDIDOS ── */}
        <div className={`section ${activeSection === 'misPedidos' ? 'active' : ''}`} id="sec-misPedidos">
          <div className="dash-header">
            <div className="dash-welcome">
              <h1>Historial de Pedidos</h1>
              <p>Gestiona y revisa tus compras anteriores</p>
            </div>
          </div>
          <div className="card-table">
            <div className="table-filters">
              <div className="search-box">
                <input type="text" placeholder="Filtrar pedidos..." />
              </div>
              <select
                className="form-select"
                style={{ width: '180px' }}
                id="filtroPedComp"
                onChange={(e) => {}}
              >
                <option value="">Todos los estados</option>
                <option>Pendiente</option>
                <option>Enviado</option>
                <option>Entregado</option>
              </select>
            </div>
            <div className="table-wrap">
              <table className="table-responsive">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody id="tbPedidosComp"></tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL FACTURA */}
      <div className={`modal-overlay ${modalFactura ? 'open' : ''}`} id="modalFactura">
        <div className="modal" style={{ maxWidth: '460px' }}>
          <div className="modal-header">
            <span className="modal-title">Detalle de Factura Electrónica</span>
            <button
              className="modal-close"
              onClick={closeModal}
            >
              ✕
            </button>
          </div>
          <div id="facturaContent"></div>
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={closeModal}
            >
              Cerrar
            </button>
            <button
              className="btn btn-primary"
              onClick={() => alert('Factura enviada al correo registrado.')}
            >
              📧 Enviar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardComprador;
