import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/styles.css';

function DashboardProductor() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('resumen');
  const [modalOpen, setModalOpen] = useState(false);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);

  const initials = (user?.nombre || 'U').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const userName = (user?.nombre || 'Productor').split(' ')[0];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [prodRes, ventasRes] = await Promise.all([
          fetch('/api/productos/mis-productos').then((r) => r.json()),
          fetch('/api/ventas/mis-ventas').then((r) => r.json()),
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
    document.querySelectorAll('.section').forEach((el) => el.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach((el) => el.classList.remove('active'));
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

  const handleImageClick = () => {
    document.getElementById('imagenInput')?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      // Existing functionality preserved; preview can be reintegrated here if needed
    };
    reader.readAsDataURL(file);
  };

  const activeProductos = productos.filter((p) => p.activo).length;
  const totalVentas = ventas.length;
  const totalRevenue = ventas.filter((v) => String(v.estado).toUpperCase() !== 'CANCELADO').reduce((sum, v) => sum + Number(v.total || 0), 0);
  const promedioCalificacion = 4.9;
  const pendingCount = ventas.filter((v) => String(v.estado).toUpperCase() === 'PENDIENTE').length;

  const getStatusBadge = (estado) => {
    const e = String(estado || '').toUpperCase();
    if (e === 'PENDIENTE' || e === 'CONFIRMADO') {
      return { cls: 'badge-status status-pending', text: '🟡 Pendiente' };
    }
    if (e === 'ENVIADO' || e === 'PREPARANDO' || e === 'EN_CAMINO') {
      return { cls: 'badge-status status-shipped', text: '🟢 Enviado' };
    }
    if (e === 'ENTREGADO' || e === 'COMPLETADO' || e === 'FINALIZADO') {
      return { cls: 'badge-status status-delivered', text: '✅ Entregado' };
    }
    return { cls: 'badge-status', text: estado };
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-user">
          <div className="avatar avatar-green" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
            {initials}
          </div>
          <div className="sidebar-user-info">
            <span className="name">{user?.nombre || 'Luis Palacios'}</span>
            <span className="role">Productor ASAFRUT</span>
            <div className="rating">⭐ {promedioCalificacion} (120 reseñas)</div>
          </div>
        </div>

        <div className="sidebar-label">Gestión Comercial</div>
        <a
          href="#"
          className={`sidebar-link ${activeSection === 'resumen' ? 'active' : ''}`}
          id="link-resumen"
          onClick={(e) => {
            e.preventDefault();
            showSection('resumen');
          }}
        >
          <span className="icon">📊</span> Panel General
        </a>
        <a
          href="#"
          className={`sidebar-link ${activeSection === 'misProductos' ? 'active' : ''}`}
          id="link-misProductos"
          onClick={(e) => {
            e.preventDefault();
            showSection('misProductos');
          }}
        >
          <span className="icon">📦</span> Inventario
        </a>
        <a
          href="#"
          className={`sidebar-link ${activeSection === 'pedidosRec' ? 'active' : ''}`}
          id="link-pedidosRec"
          onClick={(e) => {
            e.preventDefault();
            showSection('pedidosRec');
          }}
        >
          <span className="icon">🧾</span> Ventas <span className="badge-count">{pendingCount}</span>
        </a>

        <div className="sidebar-divider"></div>
        <div className="sidebar-label">Logística</div>
        <a href="/envios" className="sidebar-link">
          <span className="icon">🚚</span> Despachos
        </a>
        <a href="/mensajeria" className="sidebar-link">
          <span className="icon">💬</span> Mensajería
        </a>

        <a
          href="#"
          className="sidebar-link"
          style={{ marginTop: 'auto', color: 'var(--red)' }}
          onClick={(e) => {
            e.preventDefault();
            handleLogout();
          }}
        >
          <span className="icon">🔒</span> Cerrar sesión
        </a>
      </aside>

      <main className="main-content">
        <div className={`section ${activeSection === 'resumen' ? 'active' : ''}`} id="sec-resumen">
          <div className="dash-header">
            <div className="dash-welcome">
              <h1>¡Excelente día, {userName}! 👨‍🌾</h1>
              <p>Tu cosecha está teniendo un gran rendimiento este mes en Urabá.</p>
            </div>
            <button className="btn-cta" onClick={openProductoModal}>
              Publicar Producto +
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card color-1">
              <span className="stat-icon-lg">📦</span>
              <div className="stat-label">Productos Activos</div>
              <div className="stat-value">{String(activeProductos).padStart(2, '0')}</div>
              <div className="stat-trend">En venta ahora</div>
              <div className="stat-progress">
                <div className="stat-progress-bar" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div className="stat-card color-2">
              <span className="stat-icon-lg">🧾</span>
              <div className="stat-label">Ventas del Mes</div>
              <div className="stat-value">{totalVentas}</div>
              <div className="stat-trend up">↑ 8 pedidos nuevos</div>
              <div className="stat-progress">
                <div className="stat-progress-bar" style={{ width: '60%', background: 'var(--blue)' }}></div>
              </div>
            </div>
            <div className="stat-card color-3">
              <span className="stat-icon-lg">💰</span>
              <div className="stat-label">Ingresos Totales</div>
              <div className="stat-value">${(totalRevenue / 1000000).toFixed(1)}M</div>
              <div className="stat-trend up">↑ 15% vs Abril</div>
              <div className="stat-progress">
                <div className="stat-progress-bar" style={{ width: '75%', background: 'var(--gold)' }}></div>
              </div>
            </div>
            <div className="stat-card color-4">
              <span className="stat-icon-lg">⭐</span>
              <div className="stat-label">Calificación</div>
              <div className="stat-value">{promedioCalificacion}</div>
              <div className="stat-trend">Top Vendedor Urabá</div>
              <div className="stat-progress">
                <div className="stat-progress-bar" style={{ width: '98%', background: '#a855f7' }}></div>
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
                  <tbody>
                    {ventas.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                          Sin ventas registradas
                        </td>
                      </tr>
                    )}
                    {ventas.slice(0, 5).map((v) => {
                      const badge = getStatusBadge(v.estado);
                      return (
                        <tr key={v.id}>
                          <td data-label="Pedido">#{v.id}</td>
                          <td data-label="Comprador">{v.compradorNombre || '—'}</td>
                          <td data-label="Total">${Number(v.total || 0).toLocaleString('es-CO')}</td>
                          <td data-label="Estado">
                            <span className={badge.cls}>{badge.text}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-table" style={{ padding: '24px' }}>
              <h3 className="card-title">📊 Ventas x Producto</h3>
              <div className="chart-container">
                <div className="chart-bar" style={{ height: '80%' }} data-label="Banano"></div>
                <div className="chart-bar" style={{ height: '40%', background: 'var(--gold)' }} data-label="Mango"></div>
                <div className="chart-bar" style={{ height: '20%', background: 'var(--blue)' }} data-label="Coco"></div>
              </div>
            </div>
          </div>
        </div>

        <div className={`section ${activeSection === 'misProductos' ? 'active' : ''}`} id="sec-misProductos">
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
                  {productos.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                        No tienes productos publicados.
                      </td>
                    </tr>
                  )}
                  {productos.map((p) => (
                    <tr key={p.id}>
                      <td data-label="Producto">{p.nombre}</td>
                      <td data-label="Tipo">{p.tipoFruta}</td>
                      <td data-label="Precio/kg">${Number(p.precio || 0).toLocaleString('es-CO')}</td>
                      <td data-label="Stock">{p.cantidadDisponible} kg</td>
                      <td data-label="Estado">
                        <span
                          className={p.activo ? 'badge-status status-shipped' : 'badge-status status-pending'}
                          style={{
                            background: p.activo ? '#d1fae5' : '#fee2e2',
                            color: p.activo ? '#166534' : '#991b1b',
                            border: `1px solid ${p.activo ? '#c6f6d5' : '#fecaca'}`,
                            padding: '4px 10px',
                            borderRadius: '99px',
                            fontSize: '.78rem',
                            fontWeight: 700,
                          }}
                        >
                          {p.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td data-label="Acciones">
                        <button className="btn btn-sm" onClick={() => alert('Editar: ' + p.nombre)} style={{ marginRight: '4px' }}>
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: '#fef2f2', color: '#dc2626' }}
                          onClick={async () => {
                            if (window.confirm('¿Eliminar este producto permanentemente?')) {
                              await fetch(`/api/productos/${p.id}`, { method: 'DELETE' });
                              setProductos((prev) => prev.filter((prod) => prod.id !== p.id));
                            }
                          }}
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={`section ${activeSection === 'pedidosRec' ? 'active' : ''}`} id="sec-pedidosRec">
          <div className="dash-header">
            <h1>Gestión de Ventas</h1>
          </div>
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
                  {ventas.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                        Aún no tienes ventas registradas.
                      </td>
                    </tr>
                  )}
                  {ventas.map((v) => {
                    const estado = String(v.estado || '').toUpperCase();
                    return (
                      <tr key={v.id}>
                        <td data-label="ID">#{v.id}</td>
                        <td data-label="Producto">{v.productoNombre || '—'}</td>
                        <td data-label="Comprador">{v.compradorNombre || '—'}</td>
                        <td data-label="Cant.">{v.cantidad || 0} kg</td>
                        <td data-label="Total">${Number(v.total || 0).toLocaleString('es-CO')}</td>
                        <td data-label="Estado">{v.estado}</td>
                        <td data-label="Acciones">
                          {(estado === 'PENDIENTE' || estado === 'CONFIRMADO') && (
                            <button
                              className="btn btn-sm"
                              style={{ marginRight: '4px' }}
                              onClick={async () => {
                                await fetch(`/api/ventas/${v.id}/avanzar`, { method: 'POST' });
                                window.location.reload();
                              }}
                            >
                              Despachar
                            </button>
                          )}
                          {(estado === 'ENVIADO' || estado === 'PREPARANDO' || estado === 'EN_CAMINO') && (
                            <button
                              className="btn btn-sm"
                              style={{ background: '#eff6ff', color: '#1d4ed8' }}
                              onClick={async () => {
                                await fetch(`/api/ventas/${v.id}/avanzar`, { method: 'POST' });
                                window.location.reload();
                              }}
                            >
                              Entregado
                            </button>
                          )}
                          {!['PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'PREPARANDO', 'EN_CAMINO'].includes(estado) && (
                            <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Completado</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <div className={`modal-overlay ${modalOpen ? 'open' : ''}`} id="modalProducto">
        <div className="modal">
          <div className="modal-header">
            <span className="modal-title" id="modalTitle">
              Publicar nuevo producto
            </span>
            <button className="modal-close" onClick={closeProductoModal}>
              ✕
            </button>
          </div>
          <div className="form-group">
            <label className="form-label">Nombre del producto</label>
            <input className="form-input" id="pNombre" placeholder="Ej. Banano Urabá" />
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
              <input className="form-input" id="pPrecio" type="number" placeholder="$ 0" />
            </div>
            <div className="form-group">
              <label className="form-label">Stock disponible (kg)</label>
              <input className="form-input" id="pStock" type="number" placeholder="0" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-textarea" id="pDesc" rows="3" placeholder="Describe la calidad, procedencia..."></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Imagen del producto</label>
            <div
              onClick={handleImageClick}
              style={{
                border: '1.5px dashed #d1d5db',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                color: '#9ca3af',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '24px', display: 'block' }}>📷</span>
              <span style={{ fontSize: '12px', display: 'block' }}>Haz clic para subir imagen</span>
              <input type="file" id="imagenInput" accept="image/jpeg,image/jpg,image/png,image/webp" style={{ display: 'none' }} onChange={handleImageChange} />
            </div>
          </div>
          <div className="modal-footer" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={closeProductoModal}>
              Cancelar
            </button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={guardarProducto}>
              Guardar producto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardProductor;
