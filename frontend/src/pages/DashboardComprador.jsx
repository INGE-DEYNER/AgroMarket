import { useState, useEffect } from 'react';
import useStyles from '../hooks/useStyles';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import api from '../utils/api';

export default function DashboardComprador() {
  useStyles(["/css/styles.css"]);
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('resumen');
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modalFactura, setModalFactura] = useState(false);
  const [facturaData, setFacturaData] = useState(null);
  
  const currentDate = new Date().toLocaleDateString(i18n.language || 'es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

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
            <span className="role">{t('dashboardComprador.premiumClient', 'Cliente Premium')}</span>
          </div>
        </div>

        <div className="sidebar-label">{t('dashboardComprador.nav.title', 'Navegación')}</div>
        <a href="#" className={`sidebar-link${activeSection === 'resumen' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); showSection('resumen'); }}>
          <span className="icon">📊</span> {t('dashboardComprador.nav.summary', 'Resumen')}
        </a>
        <Link to="/catalogo" className="sidebar-link">
          <span className="icon">🛍️</span> {t('dashboardComprador.nav.explore', 'Explorar Catálogo')}
        </Link>
        <a href="#" className={`sidebar-link${activeSection === 'misPedidos' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); showSection('misPedidos'); }}>
          <span className="icon">🧾</span> {t('dashboardComprador.nav.myOrders', 'Mis Pedidos')} <span className="badge-count">{pedidos.length}</span>
        </a>

        <div className="sidebar-divider"></div>
        <div className="sidebar-label">{t('dashboardComprador.services.title', 'Servicios')}</div>
        <Link to="/envios" className="sidebar-link"><span className="icon">🚚</span> {t('dashboardComprador.services.tracking', 'Seguimiento')}</Link>
        <Link to="/mensajeria" className="sidebar-link"><span className="icon">💬</span> {t('dashboardComprador.services.messaging', 'Mensajería')}</Link>
        <Link to="/resenas" className="sidebar-link"><span className="icon">⭐</span> {t('dashboardComprador.services.reviews', 'Mis Reseñas')}</Link>

        <a href="#" className="sidebar-link" style={{ marginTop: 'auto', color: 'var(--red)' }} onClick={async (e) => { e.preventDefault(); await logout(); navigate('/login'); }}>
          <span className="icon">🔒</span> {t('dashboardComprador.services.logout', 'Cerrar sesión')}
        </a>
      </aside>

      {/* MOBILE NAV */}
      <nav className="mobile-nav">
        <a href="#" className={`mobile-nav-item${activeSection === 'resumen' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); showSection('resumen'); }}>
          <span className="icon">🏠</span><span>{t('dashboardComprador.mobileNav.home', 'Inicio')}</span>
        </a>
        <Link to="/catalogo" className="mobile-nav-item"><span className="icon">🛍️</span><span>{t('dashboardComprador.mobileNav.shop', 'Tienda')}</span></Link>
        <a href="#" className="mobile-nav-item" onClick={(e) => { e.preventDefault(); showSection('misPedidos'); }}><span className="icon">🧾</span><span>{t('dashboardComprador.mobileNav.orders', 'Pedidos')}</span></a>
        <Link to="/mensajeria" className="mobile-nav-item"><span className="icon">💬</span><span>{t('dashboardComprador.mobileNav.chat', 'Chat')}</span></Link>
        <Link to="/login" className="mobile-nav-item"><span className="icon">👤</span><span>{t('dashboardComprador.mobileNav.profile', 'Perfil')}</span></Link>
      </nav>

      <main className="main-content">
        {/* Language Switcher Dropdown */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <LanguageSwitcher />
        </div>

        {/* RESUMEN */}
        <div className={`section${activeSection === 'resumen' ? ' active' : ''}`} id="sec-resumen">
          <div className="dash-header">
            <div className="dash-welcome">
              <h1>{t('dashboardComprador.welcome', '¡Hola de nuevo, {{name}}! 👋', { name: nombreUsuario })}</h1>
              <p id="currentDate">{currentDate} • ☀️ 28°C {t('dashboardComprador.sub', 'Urabá')}</p>
            </div>
            <Link to="/catalogo" className="btn-cta">{t('dashboardComprador.exploreCatalog', 'Explorar catálogo →')}</Link>
          </div>

          <div className="stats-grid">
            <div className="stat-card color-1">
              <span className="stat-icon-lg">📦</span>
              <div className="stat-label">{t('dashboardComprador.stats.ordersPlaced', 'Pedidos Realizados')}</div>
              <div className="stat-value">{String(pedidos.length).padStart(2, '0')}</div>
              <div className="stat-trend up">{t('dashboardComprador.stats.trendOrders', '↑ 12% vs mes anterior')}</div>
              <div className="stat-progress"><div className="stat-progress-bar" style={{ width: '70%' }}></div></div>
            </div>
            <div className="stat-card color-2">
              <span className="stat-icon-lg">💰</span>
              <div className="stat-label">{t('dashboardComprador.stats.totalInvestment', 'Inversión Total')}</div>
              <div className="stat-value">${pedidos.reduce((sum, p) => sum + Number(p.total || 0), 0).toLocaleString('es-CO')}</div>
              <div className="stat-trend up">{t('dashboardComprador.stats.trendInvestment', 'Basado en pedidos')}</div>
              <div className="stat-progress"><div className="stat-progress-bar" style={{ width: '45%', background: 'var(--blue)' }}></div></div>
            </div>
            <div className="stat-card color-3">
              <span className="stat-icon-lg">⭐</span>
              <div className="stat-label">{t('dashboardComprador.stats.reviewsLeft', 'Reseñas Dejadas')}</div>
              <div className="stat-value">0</div>
              <div className="stat-trend">{t('dashboardComprador.stats.trendReviews', 'Nivel de opinión')}</div>
              <div className="stat-progress"><div className="stat-progress-bar" style={{ width: '30%', background: 'var(--gold)' }}></div></div>
            </div>
            <div className="stat-card color-4">
              <span className="stat-icon-lg">🤝</span>
              <div className="stat-label">{t('dashboardComprador.stats.producers', 'Productores')}</div>
              <div className="stat-value">0</div>
              <div className="stat-trend">{t('dashboardComprador.stats.trendProducers', 'Contactos activos')}</div>
              <div className="stat-progress"><div className="stat-progress-bar" style={{ width: '85%', background: '#a855f7' }}></div></div>
            </div>
          </div>

          {/* TABLA RECIENTES */}
          <div className="card-table" style={{ marginBottom: '32px' }}>
            <div className="table-header">
              <h3 className="card-title">📦 {t('dashboardComprador.recentOrders', 'Pedidos Recientes')}</h3>
              <a href="#" onClick={(e) => { e.preventDefault(); showSection('misPedidos'); }} style={{ fontSize: '0.8rem', fontWeight: '600' }}>{t('dashboardComprador.viewAllOrders', 'Ver todos los pedidos')}</a>
            </div>
            <div className="table-filters">
              <div className="search-box">
                <input type="text" placeholder={t('dashboardComprador.searchPlaceholder', 'Buscar por producto o ID...')} />
              </div>
            </div>
            <div className="table-wrap">
              <table className="table-responsive">
                <thead>
                  <tr>
                    <th>{t('pedidos.id', 'ID')}</th><th>{t('pedidos.product', 'Producto')}</th><th>{t('pedidos.total', 'Total')}</th><th>{t('pedidos.statusHeader', 'Estado')}</th><th>{t('pedidos.actions', 'Acciones')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.slice(0, 5).map((p) => (
                    <tr key={p.id}>
                      <td data-label={t('pedidos.id', 'ID')}>#{p.id}</td>
                      <td data-label={t('pedidos.product', 'Producto')}>{p.producto || p.nombreProducto || '—'}</td>
                      <td data-label={t('pedidos.total', 'Total')}>${Number(p.total).toLocaleString('es-CO')}</td>
                      <td data-label={t('pedidos.statusHeader', 'Estado')}><span className={badgeClass(p.estado)}>{t('pedidos.status.' + p.estado?.toLowerCase(), p.estado)}</span></td>
                      <td data-label={t('pedidos.actions', 'Acciones')}>
                        <Link to="/envios" className="btn btn-secondary btn-sm">{t('pedidos.track', 'Rastrear')}</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MIS PEDIDOS */}
        <div className={`section${activeSection === 'misPedidos' ? ' active' : ''}`} id="sec-misPedidos">
          <div className="dash-header">
            <div className="dash-welcome">
              <h1>{t('dashboardComprador.nav.myOrders', 'Historial de Pedidos')}</h1>
              <p>{t('dashboardComprador.ordersSub', 'Gestiona y revisa tus compras anteriores')}</p>
            </div>
          </div>
          <div className="card-table">
            <div className="table-filters">
              <div className="search-box">
                <input type="text" placeholder={t('dashboardComprador.filterPlaceholder', 'Filtrar pedidos...')} />
              </div>
              <select className="form-select" style={{ width: '180px' }} id="filtroPedComp" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                <option value="">{t('pedidos.allStates', 'Todos los estados')}</option>
                <option value="Pendiente">{t('pedidos.status.pendiente', 'Pendiente')}</option>
                <option value="Enviado">{t('pedidos.status.enviado', 'Enviado')}</option>
                <option value="Entregado">{t('pedidos.status.entregado', 'Entregado')}</option>
              </select>
            </div>
            <div className="table-wrap">
              <table className="table-responsive">
                <thead>
                  <tr>
                    <th>{t('pedidos.id', 'ID')}</th><th>{t('pedidos.product', 'Producto')}</th><th>{t('pedidos.quantity', 'Cantidad')}</th><th>{t('pedidos.total', 'Total')}</th><th>{t('pedidos.statusHeader', 'Estado')}</th><th>{t('pedidos.actions', 'Acciones')}</th>
                  </tr>
                </thead>
                <tbody id="tbPedidosComp">
                  {pedidosFiltrados.map((p) => (
                    <tr key={p.id}>
                      <td data-label={t('pedidos.id', 'ID')}>#{p.id}</td>
                      <td data-label={t('pedidos.product', 'Producto')}>{p.producto || p.nombreProducto || '—'}</td>
                      <td data-label={t('pedidos.quantity', 'Cantidad')}>{p.cantidad || '—'} kg</td>
                      <td data-label={t('pedidos.total', 'Total')}>${Number(p.total).toLocaleString('es-CO')}</td>
                      <td data-label={t('pedidos.statusHeader', 'Estado')}><span className={badgeClass(p.estado)}>{t('pedidos.status.' + p.estado?.toLowerCase(), p.estado)}</span></td>
                      <td data-label={t('pedidos.actions', 'Acciones')}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openFactura(p)}>{t('pedidos.invoice', '📄 Factura')}</button>
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
              <span className="modal-title">{t('pedidos.invoiceDetailTitle', 'Detalle de Factura Electrónica')}</span>
              <button className="modal-close" onClick={() => setModalFactura(false)}>✕</button>
            </div>
            <div id="facturaContent">
              {facturaData && (
                <div style={{ padding: '24px' }}>
                  <p><strong>{t('pedidos.invoiceDetail.id', 'Pedido #:')}</strong> {facturaData.id}</p>
                  <p><strong>{t('pedidos.invoiceDetail.product', 'Producto:')}</strong> {facturaData.producto || facturaData.nombreProducto}</p>
                  <p><strong>{t('pedidos.invoiceDetail.total', 'Total:')}</strong> ${Number(facturaData.total).toLocaleString('es-CO')}</p>
                  <p><strong>{t('pedidos.invoiceDetail.status', 'Estado:')}</strong> {t('pedidos.status.' + facturaData.estado?.toLowerCase(), facturaData.estado)}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalFactura(false)}>{t('pedidos.close', 'Cerrar')}</button>
              <button className="btn btn-primary" onClick={() => alert(t('pedidos.invoiceSent', 'Factura enviada al correo registrado.'))}>{t('pedidos.sendPdf', '📧 Enviar PDF')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

