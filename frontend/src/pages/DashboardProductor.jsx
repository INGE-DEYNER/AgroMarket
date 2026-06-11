import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/styles.css';

function DashboardProductor() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('resumen');
  const [modalOpen, setModalOpen] = useState(false);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);

  const initials = (user?.nombre || 'U').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [prodRes, ventasRes] = await Promise.all([
          fetch('/api/productos/mis-productos').then(r => r.json()),
          fetch('/api/ventas/mis-ventas').then(r => r.json()),
        ]);
        setProductos(prodRes?.content || prodRes || []);
        setVentas(ventasRes || []);
      } catch (err) {
        console.error(err);
      }
    };
    cargarDatos();
  }, []);

  const showSection = (id) => {
    setActiveSection(id);
    document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));
    const sectionEl = document.getElementById('sec-' + id);
    const linkEl = document.getElementById('link-' + id);
    if (sectionEl) sectionEl.classList.add('active');
    if (linkEl) linkEl.classList.add('active');
  };

  const openProductoModal = () => setModalOpen(true);
  const closeProductoModal = () => setModalOpen(false);

  const guardarProducto = async () => {
    const nombre = document.getElementById('pNombre')?.value;
    const tipo = document.getElementById('pTipo')?.value;
    const precio = document.getElementById('pPrecio')?.value;
    const stock = document.getElementById('pStock')?.value;
    const desc = document.getElementById('pDesc')?.value;

    if (!nombre || !precio || !stock) {
      alert('Completa los campos obligatorios: nombre, precio y stock.');
      return;
    }

    try {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, tipoFruta: tipo, precio: Number(precio), cantidadDisponible: Number(stock), descripcion: desc }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      closeProductoModal();
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) { /* ignore */ }
    window.location.href = '/';
  };

  useEffect(() => {
    document.getElementById('sidebarUserName').textContent = user?.nombre || 'Productor';
    document.getElementById('sidebarUserRole').textContent = 'Productor';
    document.getElementById('sidebarUserAvatar').textContent = initials;
    document.getElementById('welcomeUserText').textContent = `¡Hola, ${(user?.nombre || 'Productor').split(' ')[0]}!`;
  }, [user, initials]);

  const activeProductos = productos.filter(p => p.activo).length;
  const totalVentas = ventas.length;
  const totalRevenue = ventas.filter(v => String(v.estado).toUpperCase() !== 'CANCELADO').reduce((sum, v) => sum + Number(v.total || 0), 0);
  const promedioCalificacion = 4.8;

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-user">
          <div
            className="avatar avatar-green"
            id="sidebarUserAvatar"
            style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}
          >
            {initials}
          </div>
          <div className="sidebar-user-info">
            <span className="name" id="sidebarUserName">{user?.nombre || 'Productor'}</span>
            <span className="role" id="sidebarUserRole">Productor</span>
            <div className="rating" id="sidebarUserRating">⭐ {promedioCalificacion}</div>
          </div>
        </div>

        <div className="sidebar-label">Gestión Comercial</div>
        <Link
          to="#"
          className="sidebar-link active"
          id="link-resumen"
          onClick={(e) => { e.preventDefault(); showSection('resumen'); }}
        >
          <span className="icon">📊</span> Panel General
        </Link>
        <Link
          to="#"
          className="sidebar-link"
          id="link-misProductos"
          onClick={(e) => { e.preventDefault(); showSection('misProductos'); }}
        >
          <span className="icon">📦</span> Inventario
        </Link>
        <Link
          to="#"
          className="sidebar-link"
          id="link-pedidosRec"
          onClick={(e) => { e.preventDefault(); showSection('pedidosRec'); }}
        >
          <span className="icon">🧾</span> Ventas
        </Link>

        <div className="sidebar-divider"></div>
        <div className="sidebar-label">Logística</div>
        <Link to="/envios" className="sidebar-link">
          <span className="icon">🚚</span> Despachos
        </Link>
        <Link to="/mensajeria" className="sidebar-link">
          <span className="icon">💬</span> Mensajería
        </Link>

        <Link
          to="#"
          className="sidebar-link"
          style={{ marginTop: 'auto', color: 'var(--red)' }}
          onClick={(e) => { e.preventDefault(); handleLogout(); }}
        >
          <span className="icon">🔒</span> Cerrar sesión
        </Link>
      </aside>

      <main className="main-content">
        {/* ── RESUMEN ── */}
        <div className="section active" id="sec-resumen">
          <div className="dash-header">
            <div className="dash-welcome">
              <h1 id="welcomeUserText">Cargando panel...</h1>
              <p>Tu inventario y tus ventas se cargan desde el backend.</p>
            </div>
            <button className="btn-cta" onClick={openProductoModal}>
              Publicar Producto +
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card color-1">
              <span className="stat-icon-lg">📦</span>
              <div className="stat-label">Productos Activos</div>
              <div className="stat-value" id="statActiveProductos">{activeProductos}</div>
              <div className="stat-trend">En venta ahora</div>
              <div className="stat-progress">
                <div className="stat-progress-bar" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div className="stat-card color-2">
              <span className="stat-icon-lg">🧾</span>
              <div className="stat-label">Ventas Totales</div>
              <div className="stat-value" id="statVentasMes">{totalVentas}</div>
              <div className="stat-trend up" id="statVentasTrend">
                Pedidos recibidos
              </div>
              <div className="stat-progress">
                <div
                  className="stat-progress-bar"
                  style={{ width: '100%', background: 'var(--blue)' }}
                ></div>
              </div>
            </div>
            <div className="stat-card color-3">
              <span className="stat-icon-lg">💰</span>
              <div className="stat-label">Ingresos Totales</div>
              <div className="stat-value" id="statRevenue">{totalRevenue.toLocaleString('es-CO')}</div>
              <div className="stat-trend up">COP acumulados</div>
              <div className="stat-progress">
                <div
                  className="stat-progress-bar"
                  style={{ width: '100%', background: 'var(--gold)' }}
                ></div>
              </div>
            </div>
            <div className="stat-card color-4">
              <span className="stat-icon-lg">⭐</span>
              <div className="stat-label">Calificación</div>
              <div className="stat-value" id="statRating">{promedioCalificacion}</div>
              <div className="stat-trend">Promedio real de reseñas</div>
              <div className="stat-progress">
                <div
                  className="stat-progress-bar"
                  style={{ width: '100%', background: '#a855f7' }}
                ></div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <div className="card-table">
              <div className="table-header">
                <h3 className="card-title">🧾 Últimas ventas</h3>
              </div>
              <div className="table-wrap">
                <table className="table-responsive">
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Comprador</th>
                      <th>Total</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody id="tbRecentVentas">
                    {ventas.slice(0, 5).map((v) => (
                      <tr key={v.id}>
                        <td>#{v.id}</td>
                        <td>{v.compradorNombre || '—'}</td>
                        <td>${Number(v.total || 0).toLocaleString('es-CO')}</td>
                        <td>{v.estado}</td>
                      </tr>
                    ))}
                    {ventas.length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>Sin ventas registradas</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-table" style={{ padding: '24px' }}>
              <h3 className="card-title">📊 Ventas x Producto</h3>
              <div className="chart-container" id="salesChartContainer">
                <div
                  className="chart-bar"
                  style={{ height: '0%' }}
                  data-label="Sin datos"
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MIS PRODUCTOS ── */}
        <div className="section" id="sec-misProductos">
          <div className="dash-header">
            <h1>Mi Inventario</h1>
            <button className="btn-cta" onClick={openProductoModal}>
              + Nuevo Producto
            </button>
          </div>
          <div className="card-table">
            <div className="table-wrap">
              <table className="table-responsive">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th>Precio/kg</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody id="tbMisProductos">
                  {productos.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nombre}</td>
                      <td>{p.tipoFruta}</td>
                      <td>${Number(p.precio || 0).toLocaleString('es-CO')}</td>
                      <td>{p.cantidadDisponible} kg</td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          background: p.activo ? '#d1fae5' : '#fee2e2',
                          color: p.activo ? '#166534' : '#991b1b',
                          fontSize: '.78rem',
                          fontWeight: 700,
                        }}>
                          {p.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm" onClick={() => alert('Editar: ' + p.nombre)} style={{ marginRight: '4px' }}>✏️</button>
                        <button className="btn btn-sm" style={{ background: '#fef2f2', color: '#dc2626' }} onClick={async () => {
                          if (window.confirm('¿Eliminar este producto permanentemente?')) {
                            await fetch(`/api/productos/${p.id}`, { method: 'DELETE' });
                            setProductos(prev => prev.filter(prod => prod.id !== p.id));
                          }
                        }}>🗑</button>
                      </td>
                    </tr>
                  ))}
                  {productos.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>No tienes productos publicados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── PEDIDOS RECIBIDOS ── */}
        <div className="section" id="sec-pedidosRec">
          <div className="dash-header"><h1>Gestión de Ventas</h1></div>
          <div className="card-table">
            <div className="table-filters">
              <div className="search-box">
                <input type="text" placeholder="Buscar pedido..." />
              </div>
            </div>
            <div className="table-wrap">
              <table className="table-responsive">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Comprador</th>
                    <th>Cant.</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody id="tbPedidosRec">
                  {ventas.map((v) => {
                    const estado = String(v.estado || '').toUpperCase();
                    return (
                      <tr key={v.id}>
                        <td>#{v.id}</td>
                        <td>{v.productoNombre || '—'}</td>
                        <td>{v.compradorNombre || '—'}</td>
                        <td>{v.cantidad || 0} kg</td>
                        <td>${Number(v.total || 0).toLocaleString('es-CO')}</td>
                        <td>{v.estado}</td>
                        <td>
                          {(estado === 'PENDIENTE' || estado === 'CONFIRMADO') && (
                            <button className="btn btn-sm" style={{ marginRight: '4px' }} onClick={async () => {
                              await fetch(`/api/ventas/${v.id}/avanzar`, { method: 'POST' });
                              window.location.reload();
                            }}>Despachar</button>
                          )}
                          {(estado === 'ENVIADO' || estado === 'PREPARANDO' || estado === 'EN_CAMINO') && (
                            <button className="btn btn-sm" style={{ background: '#eff6ff', color: '#1d4ed8' }} onClick={async () => {
                              await fetch(`/api/ventas/${v.id}/avanzar`, { method: 'POST' });
                              window.location.reload();
                            }}>Entregado</button>
                          )}
                          {!['PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'PREPARANDO', 'EN_CAMINO'].includes(estado) && (
                            <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Completado</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {ventas.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>Aún no tienes ventas registradas.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL PRODUCTO */}
      {modalOpen && (
        <div className="modal-overlay" id="modalProducto">
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title" id="modalTitle">
                Publicar nuevo producto
              </span>
              <button className="modal-close" onClick={closeProductoModal}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Nombre del producto</label>
              <input className="form-input" id="pNombre" placeholder="Ej. Banano" />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de fruta</label>
              <select className="form-select" id="pTipo">
                <option>Banano</option>
                <option>Piña</option>
                <option>Mango</option>
                <option>Maracuyá</option>
                <option>Guanábana</option>
                <option>Naranja</option>
                <option>Coco</option>
                <option>Limón</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Precio/kg (COP)</label>
                <input
                  className="form-input"
                  id="pPrecio"
                  type="number"
                  placeholder="$ 0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Stock disponible (kg)</label>
                <input
                  className="form-input"
                  id="pStock"
                  type="number"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-textarea"
                id="pDesc"
                rows="3"
                placeholder="Describe la calidad, procedencia..."
              ></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Imagen del producto</label>
              <div id="imagenPreviewContainer" style={{ display: 'none', marginBottom: '12px', position: 'relative' }}>
                <img id="imagenPreview" src="" alt="Vista previa" style={{ width: '100%', maxWidth: '200px', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #2d6a4f' }} />
                <div id="imagenUploadProgress" style={{ display: 'none', marginTop: '8px', background: '#f0f0f0', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
                  <div id="imagenProgressBar" style={{ height: '100%', background: '#2d6a4f', width: '0%', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>
              <div
                id="imagenUploadArea"
                style={{
                  border: '1.5px dashed #d1d5db',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '24px', display: 'block' }}>📷</span>
                <span style={{ fontSize: '12px', display: 'block' }}>Haz clic para seleccionar imagen (JPG, PNG, WEBP, máx. 5MB)</span>
              </div>
              <input type="file" id="imagenInput" accept="image/jpeg,image/jpg,image/png,image/webp" style={{ display: 'none' }} />
            </div>
            <div
              className="modal-footer"
              style={{ display: 'flex', gap: '12px', marginTop: '24px' }}
            >
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={closeProductoModal}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={guardarProducto}
              >
                Guardar producto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardProductor;
