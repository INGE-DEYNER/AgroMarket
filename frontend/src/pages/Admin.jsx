import { useState, useEffect } from 'react';
import useStyles from '../hooks/useStyles';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import api from '../utils/api';

export default function Admin() {
  useStyles(["/css/styles.css"]);
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('usuarios');
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [resenas, setResenas] = useState([]);
  const [searchUsuarios, setSearchUsuarios] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [u, p, r] = await Promise.all([
        api.get('/admin/usuarios').catch(() => []),
        api.get('/productos').catch(() => []),
        api.get('/resenas').catch(() => []),
      ]);
      setUsuarios(Array.isArray(u) ? u : u.content || []);
      setProductos(Array.isArray(p) ? p : p.content || []);
      setResenas(Array.isArray(r) ? r : r.content || []);
    } catch {}
  };

  const usuariosFiltrados = searchUsuarios
    ? usuarios.filter((u) => u.nombre?.toLowerCase().includes(searchUsuarios.toLowerCase()) || u.email?.toLowerCase().includes(searchUsuarios.toLowerCase()))
    : usuarios;

  const desactivarUsuario = async (id) => {
    try { await api.put(`/admin/usuarios/${id}/desactivar`); loadAll(); }
    catch (err) { alert(err.message); }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm(t('dashboardProductor.confirmDelete', '¿Eliminar este producto?'))) return;
    try { await api.delete(`/productos/${id}`); loadAll(); }
    catch (err) { alert(err.message); }
  };

  const moderarResena = async (id, aprobada) => {
    try { await api.put(`/resenas/${id}/moderar`, { aprobada }); loadAll(); }
    catch (err) { alert(err.message); }
  };

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-user">
          <div className="avatar avatar-red" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>AD</div>
          <div className="sidebar-user-info">
            <span className="name">{t('admin.roleAdmin', 'Administrador')}</span>
            <span className="role">{t('admin.supportRole', 'Soporte AgroMarket')}</span>
          </div>
        </div>

        <div className="sidebar-label">{t('admin.nav.title', 'Panel de Control')}</div>
        <a href="#" className={`sidebar-link${activeSection === 'usuarios' ? ' active' : ''}`} id="link-usuarios" onClick={(e) => { e.preventDefault(); setActiveSection('usuarios'); }}>
          <span className="icon">👥</span> {t('admin.nav.users', 'Usuarios')}
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'productos' ? ' active' : ''}`} id="link-productos" onClick={(e) => { e.preventDefault(); setActiveSection('productos'); }}>
          <span className="icon">📦</span> {t('admin.nav.products', 'Productos')}
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'resenas' ? ' active' : ''}`} id="link-resenas" onClick={(e) => { e.preventDefault(); setActiveSection('resenas'); }}>
          <span className="icon">⭐</span> {t('admin.nav.moderation', 'Moderación')}
        </a>

        <div className="sidebar-divider"></div>
        <div className="sidebar-label">{t('admin.reports.title', 'Reportes')}</div>
        <a href="#" className="sidebar-link"><span className="icon">📈</span> {t('admin.reports.finance', 'Finanzas')}</a>
        <a href="#" className="sidebar-link"><span className="icon">🚛</span> {t('admin.reports.logistics', 'Logística')}</a>

        <a href="#" className="sidebar-link" style={{ marginTop: 'auto', color: 'var(--red)' }} onClick={async (e) => { e.preventDefault(); await logout(); navigate('/login'); }}>
          <span className="icon">🔒</span> {t('admin.logout', 'Cerrar sesión')}
        </a>
      </aside>

      <main className="main-content">
        {/* Language Switcher Dropdown */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <LanguageSwitcher />
        </div>

        <div className="dash-header">
          <div className="dash-welcome">
            <h1>{t('admin.title', 'Panel de Administración 🛠️')}</h1>
            <p>{t('admin.sub', 'Monitoreo global de la plataforma AgroMarket Urabá')}</p>
          </div>
          <button className="btn-cta" style={{ background: 'var(--primary-dark)' }} onClick={() => alert(t('admin.generatingReportAlert', 'Generando reporte PDF...'))}>
            {t('admin.generateReport', 'Generar Reporte Mensual 📊')}
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card color-1">
            <span className="stat-icon-lg">👥</span>
            <div className="stat-label">{t('admin.stats.totalUsers', 'Total Usuarios')}</div>
            <div className="stat-value" id="statUsuarios">{String(usuarios.length).padStart(2, '0')}</div>
            <div className="stat-trend up">{t('admin.stats.trendUsers', 'Usuarios registrados')}</div>
          </div>
          <div className="stat-card color-2">
            <span className="stat-icon-lg">📦</span>
            <div className="stat-label">{t('admin.stats.globalProducts', 'Productos Globales')}</div>
            <div className="stat-value" id="statProductos">{String(productos.length).padStart(2, '0')}</div>
            <div className="stat-trend">{t('admin.stats.trendProducts', 'En catálogo')}</div>
          </div>
          <div className="stat-card color-3">
            <span className="stat-icon-lg">💰</span>
            <div className="stat-label">{t('admin.stats.totalEarnings', 'Ingresos Totales')}</div>
            <div className="stat-value">$0</div>
            <div className="stat-trend up">{t('admin.stats.trendEarnings', 'Ingresos confirmados')}</div>
          </div>
          <div className="stat-card color-4">
            <span className="stat-icon-lg">⭐</span>
            <div className="stat-label">{t('admin.stats.alerts', 'Alertas Moderación')}</div>
            <div className="stat-value" id="statResenas">{String(resenas.filter(r => !r.aprobada).length).padStart(2, '0')}</div>
            <div className="stat-trend down" style={{ color: 'orange' }}>{t('admin.stats.trendAlerts', 'Acción requerida')}</div>
          </div>
        </div>

        <div className="grid-columns" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div className="card-table">
            {/* USUARIOS */}
            <div className={`section${activeSection === 'usuarios' ? ' active' : ''}`} id="sec-usuarios">
              <div className="table-header"><h3 className="card-title">{t('admin.usersManagement', '👥 Gestión de Usuarios')}</h3></div>
              <div className="table-filters">
                <div className="search-box">
                  <input type="text" id="searchUsuarios" placeholder={t('admin.searchUsers', 'Buscar por nombre o correo...')} value={searchUsuarios} onChange={(e) => setSearchUsuarios(e.target.value)} />
                </div>
              </div>
              <div className="table-wrap">
                <table className="table-responsive">
                  <thead>
                    <tr>
                      <th>{t('auth.firstName', 'Nombre')}</th>
                      <th>{t('auth.email', 'Correo')}</th>
                      <th>{t('profile.role', 'Rol')}</th>
                      <th>{t('pedidos.statusHeader', 'Estado')}</th>
                      <th>{t('pedidos.actions', 'Acciones')}</th>
                    </tr>
                  </thead>
                  <tbody id="tbUsuarios">
                    {usuariosFiltrados.map((u) => (
                      <tr key={u.id}>
                        <td data-label={t('auth.firstName', 'Nombre')}>{u.nombre} {u.apellido}</td>
                        <td data-label={t('auth.email', 'Correo')}>{u.email}</td>
                        <td data-label={t('profile.role', 'Rol')}><span className="badge-status">{t('auth.' + (u.role || u.rol)?.toLowerCase(), u.role || u.rol)}</span></td>
                        <td data-label={t('pedidos.statusHeader', 'Estado')}><span className={`badge-status ${u.activo !== false ? 'status-shipped' : 'status-pending'}`}>{u.activo !== false ? t('admin.active', 'Activo') : t('admin.inactive', 'Inactivo')}</span></td>
                        <td data-label={t('pedidos.actions', 'Acciones')}>
                          <button className="btn btn-secondary btn-sm" onClick={() => desactivarUsuario(u.id)}>
                            {u.activo !== false ? t('admin.deactivate', 'Desactivar') : t('admin.activate', 'Activar')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PRODUCTOS */}
            <div className={`section${activeSection === 'productos' ? ' active' : ''}`} id="sec-productos">
              <div className="table-header"><h3 className="card-title">{t('admin.globalInventory', '📦 Inventario Global')}</h3></div>
              <div className="table-wrap">
                <table className="table-responsive">
                  <thead>
                    <tr>
                      <th>{t('dashboardProductor.product', 'Producto')}</th>
                      <th>{t('pedidos.producer', 'Productor')}</th>
                      <th>{t('dashboardProductor.pricePerKg', 'Precio/kg')}</th>
                      <th>{t('dashboardProductor.stock', 'Stock')}</th>
                      <th>{t('pedidos.actions', 'Acciones')}</th>
                    </tr>
                  </thead>
                  <tbody id="tbProductos">
                    {productos.map((p) => (
                      <tr key={p.id}>
                        <td data-label={t('dashboardProductor.product', 'Producto')}>{p.nombre}</td>
                        <td data-label={t('pedidos.producer', 'Productor')}>{p.productor || p.nombreProductor || '—'}</td>
                        <td data-label={t('dashboardProductor.pricePerKg', 'Precio/kg')}>${Number(p.precio).toLocaleString('es-CO')}</td>
                        <td data-label={t('dashboardProductor.stock', 'Stock')}>{p.stock} kg</td>
                        <td data-label={t('pedidos.actions', 'Acciones')}>
                          <button className="btn btn-secondary btn-sm" style={{ color: 'var(--red)' }} onClick={() => eliminarProducto(p.id)}>{t('admin.delete', '🗑️ Eliminar')}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RESEÑAS */}
            <div className={`section${activeSection === 'resenas' ? ' active' : ''}`} id="sec-resenas">
              <div className="table-header"><h3 className="card-title">{t('admin.reviewsModeration', '⭐ Moderación de Reseñas')}</h3></div>
              <div className="table-wrap">
                <table className="table-responsive">
                  <thead>
                    <tr>
                      <th>{t('admin.user', 'Usuario')}</th>
                      <th>{t('dashboardProductor.stats.rating', 'Calificación')}</th>
                      <th>{t('dashboardProductor.description', 'Comentario')}</th>
                      <th>{t('pedidos.statusHeader', 'Estado')}</th>
                      <th>{t('pedidos.actions', 'Acciones')}</th>
                    </tr>
                  </thead>
                  <tbody id="tbResenas">
                    {resenas.map((r) => (
                      <tr key={r.id}>
                        <td data-label={t('admin.user', 'Usuario')}>{r.usuario || r.nombreUsuario || '—'}</td>
                        <td data-label={t('dashboardProductor.stats.rating', 'Calificación')}>{'★'.repeat(r.calificacion || 5)}</td>
                        <td data-label={t('dashboardProductor.description', 'Comentario')}>{r.comentario}</td>
                        <td data-label={t('pedidos.statusHeader', 'Estado')}><span className={`badge-status ${r.aprobada ? 'status-shipped' : 'status-pending'}`}>{r.aprobada ? t('pedidos.status.aprobada', 'Aprobada') : t('pedidos.status.pendiente', 'Pendiente')}</span></td>
                        <td data-label={t('pedidos.actions', 'Acciones')}>
                          <button className="btn btn-secondary btn-sm" onClick={() => moderarResena(r.id, true)}>{t('admin.approve', '✅ Aprobar')}</button>
                          <button className="btn btn-secondary btn-sm" style={{ color: 'var(--red)', marginLeft: '6px' }} onClick={() => moderarResena(r.id, false)}>{t('admin.reject', '❌ Rechazar')}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SIDEBAR INFO ADMIN */}
          <div className="side-info">
            <div className="card-table" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 className="card-title" style={{ marginBottom: '16px' }}>{t('admin.topProducers', 'Top Productores 🏆')}</h3>
              <ul style={{ listStyle: 'none' }}>
                <li style={{ padding: '8px 0', color: 'var(--text-muted)' }}>
                  {t('admin.noData', 'No hay datos suficientes')}
                </li>
              </ul>
            </div>

            <div className="card-table" style={{ padding: '24px' }}>
              <h3 className="card-title" style={{ marginBottom: '16px' }}>{t('admin.earningsSixMonths', 'Ingresos 6 Meses')}</h3>
              <div className="chart-container" style={{ height: '120px' }}>
                <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{t('admin.noEarningsData', 'Sin datos')}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

