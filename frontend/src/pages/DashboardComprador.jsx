import { useState, useEffect } from 'react';
import useStyles from '../hooks/useStyles';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function DashboardComprador() {
  useStyles(["/css/styles.css"]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('resumen');
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modalFactura, setModalFactura] = useState(false);
  const [facturaData, setFacturaData] = useState(null);
  const currentDate = new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get('/pedidos/mis-pedidos');
        setPedidos(Array.isArray(data) ? data : data.content || []);
      } catch (err) {
        console.error('Error fetching pedidos:', err);
        setPedidos([]);
      }
    })();
  }, []);

  const showSection = (s) => setActiveSection(s);

  const pedidosFiltrados = filtroEstado
    ? pedidos.filter((p) => p.estado?.toLowerCase() === filtroEstado.toLowerCase())
    : pedidos;

  const nombreUsuario = user?.nombre || 'María';
  const iniciales = (user?.nombre || 'MT').charAt(0).toUpperCase() + (user?.apellido || 'T').charAt(0).toUpperCase();

  const badgeClass = (estado) => {
    const e = estado?.toLowerCase();
    if (e === 'pendiente') return 'badge-status status-pending';
    if (e === 'enviado') return 'badge-status status-shipped';
    if (e === 'entregado') return 'badge-status status-delivered';
    return 'badge-status';
  };

  const openFactura = (pedido) => {
    setFacturaData(pedido);
    setModalFactura(true);
  };

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-user">
          <div className="avatar avatar-blue" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>{iniciales}</div>
          <div className="sidebar-user-info">
            <span className="name">{user?.nombre || 'María Torres'}</span>
            <span className="role">Cliente Premium</span>
          </div>
        </div>

        <div className="sidebar-label">Navegación</div>
        <a href="#" className={`sidebar-link${activeSection === 'resumen' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); showSection('resumen'); }}>
          <span className="icon">📊</span> Resumen
        </a>
        <Link to="/catalogo" className="sidebar-link">
          <span className="icon">🛍️</span> Explorar Catálogo
        </Link>
        <a href="#" className={`sidebar-link${activeSection === 'misPedidos' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); showSection('misPedidos'); }}>
          <span className="icon">🧾</span> Mis Pedidos <span className="badge-count">{pedidos.length}</span>
        </a>

        <div className="sidebar-divider"></div>
        <div className="sidebar-label">Servicios</div>
        <Link to="/envios" className="sidebar-link"><span className="icon">🚚</span> Seguimiento</Link>
        <Link to="/mensajeria" className="sidebar-link"><span className="icon">💬</span> Mensajería</Link>
        <Link to="/resenas" className="sidebar-link"><span className="icon">⭐</span> Mis Reseñas</Link>

        <a href="#" className="sidebar-link" style={{ marginTop: 'auto', color: 'var(--red)' }} onClick={async (e) => { e.preventDefault(); navigate('/login'); }}>
          <span className="icon">🔒</span> Cerrar sesión
        </a>
      </aside>

      {/* MOBILE NAV */}
      <nav className="mobile-nav">
        <a href="#" className={`mobile-nav-item${activeSection === 'resumen' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); showSection('resumen'); }}>
          <span className="icon">🏠</span><span>Inicio</span>
        </a>
        <Link to="/catalogo" className="mobile-nav-item"><span className="icon">🛍️</span><span>Tienda</span></Link>
        <a href="#" className="mobile-nav-item" onClick={(e) => { e.preventDefault(); showSection('misPedidos'); }}><span className="icon">🧾</span><span>Pedidos</span></a>
        <Link to="/mensajeria" className="mobile-nav-item"><span className="icon">💬</span><span>Chat</span></Link>
        <Link to="/login" className="mobile-nav-item"><span className="icon">👤</span><span>Perfil</span></Link>
      </nav>

      <main className="main-content">
        {/* RESUMEN */}
        <div className={`section${activeSection === 'resumen' ? ' active' : ''}`} id="sec-resumen">
          <div className="dash-header">
            <div className="dash-welcome">
              <h1>¡Hola de nuevo, {nombreUsuario}! 👋</h1>
              <p id="currentDate">{currentDate} • ☀️ 28°C Urabá</p>
            </div>
            <Link to="/catalogo" className="btn-cta">Explorar catálogo →</Link>
          </div>

          <div className="stats-grid">
            <div className="stat-card color-1">
              <span className="stat-icon-lg">📦</span>
              <div className="stat-label">Pedidos Realizados</div>
              <div className="stat-value">{String(pedidos.length).padStart(2, '0')}</div>
              <div className="stat-trend up">↑ 12% vs mes anterior</div>
              <div className="stat-progress"><div className="stat-progress-bar" style={{ width: '70%' }}></div></div>
            </div>
            <div className="stat-card color-2">
              <span className="stat-icon-lg">💰</span>
              <div className="stat-label">Inversión Total</div>
              <div className="stat-value">${pedidos.reduce((sum, p) => sum + Number(p.total || 0), 0).toLocaleString('es-CO')}</div>
              <div className="stat-trend up">Basado en pedidos</div>
              <div className="stat-progress"><div className="stat-progress-bar" style={{ width: '45%', background: 'var(--blue)' }}></div></div>
            </div>
            <div className="stat-card color-3">
              <span className="stat-icon-lg">⭐</span>
              <div className="stat-label">Reseñas Dejadas</div>
              <div className="stat-value">0</div>
              <div className="stat-trend">Nivel de opinión</div>
              <div className="stat-progress"><div className="stat-progress-bar" style={{ width: '30%', background: 'var(--gold)' }}></div></div>
            </div>
            <div className="stat-card color-4">
              <span className="stat-icon-lg">🤝</span>
              <div className="stat-label">Productores</div>
              <div className="stat-value">0</div>
              <div className="stat-trend">Contactos activos</div>
              <div className="stat-progress"><div className="stat-progress-bar" style={{ width: '85%', background: '#a855f7' }}></div></div>
            </div>
          </div>

          {/* TABLA RECIENTES */}
          <div className="card-table" style={{ marginBottom: '32px' }}>
            <div className="table-header">
              <h3 className="card-title">📦 Pedidos Recientes</h3>
              <a href="#" onClick={(e) => { e.preventDefault(); showSection('misPedidos'); }} style={{ fontSize: '0.8rem', fontWeight: '600' }}>Ver todos los pedidos</a>
            </div>
            <div className="table-filters">
              <div className="search-box">
                <input type="text" placeholder="Buscar por producto o ID..." />
              </div>
            </div>
            <div className="table-wrap">
              <table className="table-responsive">
                <thead>
                  <tr>
                    <th>ID</th><th>Producto</th><th>Total COP</th><th>Estado</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.slice(0, 5).map((p) => (
                    <tr key={p.id}>
                      <td data-label="ID">#{p.id}</td>
                      <td data-label="Producto">{p.producto || p.nombreProducto || '—'}</td>
                      <td data-label="Total">${Number(p.total).toLocaleString('es-CO')}</td>
                      <td data-label="Estado"><span className={badgeClass(p.estado)}>{p.estado}</span></td>
                      <td data-label="Acciones">
                        <Link to="/envios" className="btn btn-secondary btn-sm">Rastrear</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RECOMENDADOS ELIMINADO PARA USAR DATOS REALES DE API EN EL FUTURO */}
        </div>

        {/* MIS PEDIDOS */}
        <div className={`section${activeSection === 'misPedidos' ? ' active' : ''}`} id="sec-misPedidos">
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
              <select className="form-select" style={{ width: '180px' }} id="filtroPedComp" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
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
                    <th>ID</th><th>Producto</th><th>Cantidad</th><th>Total</th><th>Estado</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody id="tbPedidosComp">
                  {pedidosFiltrados.map((p) => (
                    <tr key={p.id}>
                      <td data-label="ID">#{p.id}</td>
                      <td data-label="Producto">{p.producto || p.nombreProducto || '—'}</td>
                      <td data-label="Cantidad">{p.cantidad || '—'} kg</td>
                      <td data-label="Total">${Number(p.total).toLocaleString('es-CO')}</td>
                      <td data-label="Estado"><span className={badgeClass(p.estado)}>{p.estado}</span></td>
                      <td data-label="Acciones">
                        <button className="btn btn-secondary btn-sm" onClick={() => openFactura(p)}>📄 Factura</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL FACTURA */}
      {modalFactura && (
        <div className="modal-overlay open" id="modalFactura">
          <div className="modal" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <span className="modal-title">Detalle de Factura Electrónica</span>
              <button className="modal-close" onClick={() => setModalFactura(false)}>✕</button>
            </div>
            <div id="facturaContent">
              {facturaData && (
                <div style={{ padding: '24px' }}>
                  <p><strong>Pedido #:</strong> {facturaData.id}</p>
                  <p><strong>Producto:</strong> {facturaData.producto || facturaData.nombreProducto}</p>
                  <p><strong>Total:</strong> ${Number(facturaData.total).toLocaleString('es-CO')}</p>
                  <p><strong>Estado:</strong> {facturaData.estado}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalFactura(false)}>Cerrar</button>
              <button className="btn btn-primary" onClick={() => alert('Factura enviada al correo registrado.')}>📧 Enviar PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
