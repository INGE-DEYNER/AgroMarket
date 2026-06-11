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
            style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}
          >
            AD
          </div>
          <div className="sidebar-user-info">
            <span className="name">Administrador</span>
            <span className="role">Soporte AgroMarket</span>
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
            <h1>Panel de Administración 🛠️</h1>
            <p>Monitoreo global de la plataforma AgroMarket Urabá</p>
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
            <div className="stat-value" id="statUsuarios">07</div>
            <div className="stat-trend up">↑ 2 nuevos hoy</div>
          </div>
          <div className="stat-card color-2">
            <span className="stat-icon-lg">📦</span>
            <div className="stat-label">Productos Globales</div>
            <div className="stat-value" id="statProductos">12</div>
            <div className="stat-trend">80% en stock</div>
          </div>
          <div className="stat-card color-3">
            <span className="stat-icon-lg">💰</span>
            <div className="stat-label">Ingresos Totales</div>
            <div className="stat-value">$4.8M</div>
            <div className="stat-trend up">↑ 22% este mes</div>
          </div>
          <div className="stat-card color-4">
            <span className="stat-icon-lg">⭐</span>
            <div className="stat-label">Alertas Moderación</div>
            <div className="stat-value" id="statResenas">02</div>
            <div className="stat-trend down" style={{ color: 'orange' }}>Acción requerida</div>
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
                      <th>Estado</th>
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
              <h3 className="card-title" style={{ marginBottom: '16px' }}>Top Productores 🏆</h3>
              <ul style={{ listStyle: 'none' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span>Luis Palacios</span>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>$1.2M</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span>Ana Córdoba</span>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>$980K</span>
                </li>
              </ul>
            </div>

            <div className="card-table" style={{ padding: '24px' }}>
              <h3 className="card-title" style={{ marginBottom: '16px' }}>Ingresos 6 Meses</h3>
              <div className="chart-container" style={{ height: '120px' }}>
                <div className="chart-bar" style={{ height: '30%' }}></div>
                <div className="chart-bar" style={{ height: '45%' }}></div>
                <div className="chart-bar" style={{ height: '60%' }}></div>
                <div className="chart-bar" style={{ height: '80%' }}></div>
                <div className="chart-bar" style={{ height: '95%' }}></div>
                <div className="chart-bar" style={{ height: '70%', background: 'var(--primary-light)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
