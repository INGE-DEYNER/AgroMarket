import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/styles.css';
import '../styles/admin.css';

export default function Admin() {
  const [activeSection, setActiveSection] = useState('usuarios');

  const showSection = (section) => {
    setActiveSection(section);
  };

  const handleLogout = (e) => {
    e.preventDefault();
  };

  const handleReport = () => {
    alert('Generando reporte PDF...');
  };

  const handleSearch = (e) => {
    // filterUsuarios equivalent placeholder
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-user">
          <div
            className="avatar avatar-red"
            id="sidebarUserAvatar"
            style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}
          >
            --
          </div>
          <div className="sidebar-user-info">
            <span className="name" id="sidebarUserName">Cargando perfil...</span>
            <span className="role" id="sidebarUserRole">Cargando...</span>
          </div>
        </div>

        <div className="sidebar-label">Panel de Control</div>
        <Link
          to="#"
          className={`sidebar-link ${activeSection === 'usuarios' ? 'active' : ''}`}
          id="link-usuarios"
          onClick={(e) => { e.preventDefault(); showSection('usuarios'); }}
        >
          <span className="icon">👥</span> Usuarios
        </Link>
        <Link
          to="#"
          className={`sidebar-link ${activeSection === 'productos' ? 'active' : ''}`}
          id="link-productos"
          onClick={(e) => { e.preventDefault(); showSection('productos'); }}
        >
          <span className="icon">📦</span> Productos
        </Link>
        <Link
          to="#"
          className={`sidebar-link ${activeSection === 'resenas' ? 'active' : ''}`}
          id="link-resenas"
          onClick={(e) => { e.preventDefault(); showSection('resenas'); }}
        >
          <span className="icon">⭐</span> Moderación
        </Link>

        <div className="sidebar-divider"></div>
        <div className="sidebar-label">Reportes</div>
        <Link to="#" className="sidebar-link">
          <span className="icon">📈</span> Finanzas
        </Link>
        <Link to="#" className="sidebar-link">
          <span className="icon">🚛</span> Logística
        </Link>

        <Link
          to="#"
          className="sidebar-link"
          style={{ marginTop: 'auto', color: 'var(--red)' }}
          onClick={handleLogout}
        >
          <span className="icon">🔒</span> Cerrar sesión
        </Link>
      </aside>

      <main className="main-content">
        <div className="dash-header">
          <div className="dash-welcome">
            <h1 id="welcomeUserText">Cargando panel...</h1>
            <p>Monitoreo global de la plataforma AgroMarket.</p>
          </div>
          <button
            className="btn-cta"
            style={{ background: 'var(--primary-dark)' }}
            onClick={handleReport}
          >
            Generar Reporte Mensual 📊
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card color-1">
            <span className="stat-icon-lg">👥</span>
            <div className="stat-label">Total Usuarios</div>
            <div className="stat-value" id="statUsuarios">--</div>
            <div className="stat-trend up">Registrados en AgroMarket</div>
          </div>
          <div className="stat-card color-2">
            <span className="stat-icon-lg">📦</span>
            <div className="stat-label">Productos Globales</div>
            <div className="stat-value" id="statProductos">--</div>
            <div className="stat-trend">Publicados e inventariados</div>
          </div>
          <div className="stat-card color-3">
            <span className="stat-icon-lg">💰</span>
            <div className="stat-label">Ingresos Totales</div>
            <div className="stat-value" id="statIngresos">--</div>
            <div className="stat-trend up">Transacciones en la app</div>
          </div>
          <div className="stat-card color-4">
            <span className="stat-icon-lg">⭐</span>
            <div className="stat-label">Alertas Moderación</div>
            <div className="stat-value" id="statResenas">--</div>
            <div className="stat-trend down" style={{ color: 'orange' }}>
              Reseñas cargadas
            </div>
          </div>
        </div>

        <div
          className="grid-columns"
          style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}
        >
          <div className="card-table">
            <div className={`section ${activeSection === 'usuarios' ? 'active' : ''}`} id="sec-usuarios">
              <div className="table-header">
                <h3 className="card-title">👥 Gestión de Usuarios</h3>
              </div>
              <div className="table-filters">
                <div className="search-box">
                  <input
                    type="text"
                    id="searchUsuarios"
                    placeholder="Buscar por nombre o correo..."
                    onInput={handleSearch}
                  />
                </div>
              </div>
              <div className="table-wrap">
                <table className="table-responsive">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody id="tbUsuarios"></tbody>
                </table>
              </div>
            </div>

            <div className={`section ${activeSection === 'productos' ? 'active' : ''}`} id="sec-productos">
              <div className="table-header">
                <h3 className="card-title">📦 Inventario Global</h3>
              </div>
              <div className="table-wrap">
                <table className="table-responsive">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Productor</th>
                      <th>Precio/kg</th>
                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody id="tbProductos"></tbody>
                </table>
              </div>
            </div>

            <div className={`section ${activeSection === 'resenas' ? 'active' : ''}`} id="sec-resenas">
              <div className="table-header">
                <h3 className="card-title">⭐ Moderación de Reseñas</h3>
              </div>
              <div className="table-wrap">
                <table className="table-responsive">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Calificación</th>
                      <th>Comentario</th>
                      <th>Producto</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody id="tbResenas"></tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="side-info">
            <div className="card-table" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 className="card-title" style={{ marginBottom: '16px' }}>
                Top Productores 🏆
              </h3>
              <ul style={{ listStyle: 'none' }} id="ulTopProducers">
                <li
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border-light)',
                    color: 'var(--text-muted)',
                  }}
                >
                  Cargando top productores...
                </li>
              </ul>
            </div>

            <div className="card-table" style={{ padding: '24px' }}>
              <h3 className="card-title" style={{ marginBottom: '16px' }}>
                Ingresos Semestrales
              </h3>
              <div className="chart-container" style={{ height: '120px' }}>
                <div
                  className="chart-bar"
                  style={{ height: '35%' }}
                  data-label="Ene"
                ></div>
                <div
                  className="chart-bar"
                  style={{ height: '50%' }}
                  data-label="Feb"
                ></div>
                <div
                  className="chart-bar"
                  style={{ height: '65%' }}
                  data-label="Mar"
                ></div>
                <div
                  className="chart-bar"
                  style={{ height: '75%' }}
                  data-label="Abr"
                ></div>
                <div
                  className="chart-bar"
                  style={{ height: '90%' }}
                  data-label="May"
                ></div>
                <div
                  className="chart-bar"
                  style={{ height: '98%', background: 'var(--primary-light)' }}
                  data-label="Jun"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
