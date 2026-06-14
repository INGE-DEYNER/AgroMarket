import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import api, { API_BASE } from '../utils/api';
import '../styles/admin.css';

export default function Admin() {
  const { t } = useTranslation();
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('usuarios');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sec = params.get('section');
    if (sec) {
      setActiveSection(sec);
    }
  }, [location.search]);
  
  // Profile forms state
  const [perfilForm, setPerfilForm] = useState({ nombre: '', telefono: '' });
  const [pwForm, setPwForm] = useState({ contrasenaActual: '', nuevaContrasena: '' });
  const [perfilMsg, setPerfilMsg] = useState({ type: '', text: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    if (user && activeSection === 'perfil') {
      setPerfilForm({ nombre: user.nombre || '', telefono: user.telefono || '' });
      setPerfilMsg({ type: '', text: '' });
      setPwMsg({ type: '', text: '' });
    }
  }, [user, activeSection]);

  const handleUpdatePerfil = async (e) => {
    e.preventDefault();
    setPerfilMsg({ type: '', text: '' });
    if (!perfilForm.nombre.trim() || !perfilForm.telefono.trim()) {
      setPerfilMsg({ type: 'error', text: 'Todos los campos son obligatorios.' });
      return;
    }
    try {
      const res = await api.put('/usuarios/me', perfilForm);
      const updatedUser = res.data || res;
      setUser({
        ...user,
        nombre: updatedUser.nombre || perfilForm.nombre,
        telefono: updatedUser.telefono || perfilForm.telefono
      });
      setPerfilMsg({ type: 'success', text: 'Perfil actualizado correctamente.' });
    } catch (err) {
      setPerfilMsg({ type: 'error', text: err.message || 'Error al actualizar perfil.' });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });
    if (!pwForm.contrasenaActual || !pwForm.nuevaContrasena) {
      setPwMsg({ type: 'error', text: 'Ambas contraseñas son obligatorias.' });
      return;
    }
    try {
      await api.put('/usuarios/me/contrasena', pwForm);
      setPwMsg({ type: 'success', text: 'Contraseña actualizada correctamente.' });
      setPwForm({ contrasenaActual: '', nuevaContrasena: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message || 'Debe tener al menos 1 mayúscula, 1 número y 1 carácter especial (mínimo 8 caracteres).' });
    }
  };
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [resenas, setResenas] = useState([]);
  const [pagosFideicomiso, setPagosFideicomiso] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [searchUsuarios, setSearchUsuarios] = useState('');
  const [usuariosPendientes, setUsuariosPendientes] = useState([]);

  const handleAprobarUsuario = async (userId) => {
    try {
      await api.post(`/admin/aprobar-usuario/${userId}`);
      alert('Usuario aprobado con éxito.');
      loadAll();
    } catch (err) {
      alert('Error al aprobar usuario: ' + err.message);
    }
  };

  const handleRechazarUsuario = async (userId) => {
    const motivo = window.prompt('Introduce el motivo del rechazo (opcional):');
    if (motivo === null) return;
    try {
      await api.post(`/admin/rechazar-usuario/${userId}`, { motivo });
      alert('Usuario rechazado con éxito.');
      loadAll();
    } catch (err) {
      alert('Error al rechazar usuario: ' + err.message);
    }
  };

  const extractArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (res.data) {
      if (Array.isArray(res.data)) return res.data;
      if (res.data.content && Array.isArray(res.data.content)) return res.data.content;
    }
    if (res.content && Array.isArray(res.content)) return res.content;
    return [];
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (activeSection === 'escrow') {
      loadPagosFideicomiso();
    }
  }, [activeSection]);

  const loadAll = async () => {
    try {
      const [u, p, r, db, up] = await Promise.all([
        api.get('/admin/usuarios').catch(() => []),
        api.get('/productos').catch(() => []),
        api.get('/resenas').catch(() => []),
        api.get('/admin/dashboard').catch(() => null),
        api.get('/admin/usuarios-pendientes').catch(() => []),
      ]);
      setUsuarios(extractArray(u));
      setProductos(extractArray(p));
      setResenas(extractArray(r));
      if (db) setDashboardData(db.data || db);
      setUsuariosPendientes(extractArray(up));
    } catch {}
  };

  const loadPagosFideicomiso = async () => {
    try {
      const data = await api.get('/admin/pagos/fideicomiso');
      setPagosFideicomiso(extractArray(data));
    } catch (err) {
      console.error('Error loadPagosFideicomiso:', err);
      setPagosFideicomiso([]);
    }
  };

  const liberarPago = async (pagoId) => {
    if (!window.confirm('¿Está seguro de que desea liberar estos fondos al productor?')) return;
    try {
      await api.put(`/admin/pagos/${pagoId}/liberar`);
      alert('Fondos liberados exitosamente.');
      loadPagosFideicomiso();
    } catch (err) {
      alert('Error al liberar fondos: ' + err.message);
    }
  };

  const reembolsarPago = async (pagoId) => {
    if (!window.confirm('¿Está seguro de que desea reembolsar estos fondos al comprador?')) return;
    try {
      await api.put(`/admin/pagos/${pagoId}/reembolsar`);
      alert('Fondos reembolsados exitosamente.');
      loadPagosFideicomiso();
    } catch (err) {
      alert('Error al reembolsar fondos: ' + err.message);
    }
  };

  const toggleVerificarProductor = async (u) => {
    try {
      await api.put(`/admin/productores/${u.idEncriptado}/verificar`);
      alert('Estado de verificación del productor actualizado.');
      loadAll();
    } catch (err) {
      alert(err.message || 'Error al cambiar la verificación del productor.');
    }
  };

  const handleGenerateReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/reporte/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Error al generar el reporte.');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte-mensual.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Error al generar el reporte.');
    }
  };

  const usuariosFiltrados = searchUsuarios
    ? usuarios.filter((u) => u.nombre?.toLowerCase().includes(searchUsuarios.toLowerCase()) || u.email?.toLowerCase().includes(searchUsuarios.toLowerCase()))
    : usuarios;

  const toggleUsuarioActivo = async (u) => {
    try {
      if (u.activo !== false) {
        await api.put(`/usuarios/${u.id}/deshabilitar`);
      } else {
        await api.put(`/usuarios/${u.id}/habilitar`);
      }
      loadAll();
    } catch (err) {
      alert(err.message || 'Error al cambiar estado del usuario.');
    }
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
        <a href="#" className={`sidebar-link${activeSection === 'escrow' ? ' active' : ''}`} id="link-escrow" onClick={(e) => { e.preventDefault(); setActiveSection('escrow'); }}>
          <span className="icon">💳</span> Fideicomiso (Escrow)
        </a>
        <Link to="/perfil" className="sidebar-link" id="link-perfil">
          <span className="icon">👤</span> {t('profile.title', 'Mi Perfil')}
        </Link>

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
          <button className="btn-cta" style={{ background: 'var(--primary-dark)' }} onClick={handleGenerateReport}>
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
            <div className="stat-value">
              {dashboardData?.ingresos !== undefined && dashboardData?.ingresos !== null
                ? `$${Number(dashboardData.ingresos).toLocaleString('es-CO')}`
                : '—'}
            </div>
            <div className="stat-trend up">{t('admin.stats.trendEarnings', 'Ingresos confirmados')}</div>
          </div>
          <div className="stat-card color-4">
            <span className="stat-icon-lg">⭐</span>
            <div className="stat-label">{t('admin.stats.alerts', 'Alertas Moderación')}</div>
            <div className="stat-value" id="statResenas">{String(resenas.filter(r => !r.aprobada).length).padStart(2, '0')}</div>
            <div className="stat-trend down" style={{ color: 'orange' }}>{t('admin.stats.trendAlerts', 'Acción requerida')}</div>
          </div>
        </div>

        {activeSection !== 'perfil' ? (
          <div className="grid-columns" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <div className="card-table">
              {/* USUARIOS */}
              {activeSection === 'usuarios' && (
                <div className="section active" id="sec-usuarios">
                  <div className="table-header"><h3 className="card-title">{t('admin.usersManagement', '👥 Gestión de Usuarios')}</h3></div>
                  
                  {/* PENDING APPROVALS */}
                  <div style={{ padding: '20px 24px', borderBottom: '1px dashed var(--border)' }}>
                    <h4 style={{ color: 'var(--gold)', marginBottom: '12px', fontSize: '0.95rem', fontWeight: 'bold' }}>⏳ Cuentas de Productores Pendientes de Aprobación</h4>
                    {usuariosPendientes.length === 0 ? (
                      <p style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                        No hay solicitudes de aprobación pendientes.
                      </p>
                    ) : (
                      <div className="table-wrap" style={{ marginBottom: '10px' }}>
                        <table className="table-responsive" style={{ border: '1px solid var(--gold-border)', borderRadius: '8px', overflow: 'hidden' }}>
                          <thead>
                            <tr style={{ background: 'var(--gold-bg)' }}>
                              <th>Nombre</th>
                              <th>Correo</th>
                              <th>Ubicación</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {usuariosPendientes.map((u) => (
                              <tr key={u.id}>
                                <td data-label="Nombre">{u.nombre} {u.apellido}</td>
                                <td data-label="Correo">{u.email}</td>
                                <td data-label="Ubicación">{u.ubicacion || '—'}</td>
                                <td data-label="Acciones">
                                  <button className="btn btn-primary btn-sm" onClick={() => handleAprobarUsuario(u.id)}>
                                    Aprobar ✓
                                  </button>
                                  <button className="btn btn-danger btn-sm" style={{ marginLeft: '6px' }} onClick={() => handleRechazarUsuario(u.id)}>
                                    Rechazar ❌
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

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
                              <button className="btn btn-secondary btn-sm" onClick={() => toggleUsuarioActivo(u)}>
                                {u.activo !== false ? t('admin.deactivate', 'Desactivar') : t('admin.activate', 'Activar')}
                              </button>
                              {(u.role || u.rol)?.toUpperCase() === 'PRODUCTOR' && (
                                <button className="btn btn-secondary btn-sm" style={{ marginLeft: '6px', background: u.verificado ? '#385723' : '#6b7280', color: '#fff' }} onClick={() => toggleVerificarProductor(u)}>
                                  {u.verificado ? '⭐ Verificado' : 'Verificar'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PRODUCTOS */}
              {activeSection === 'productos' && (
                <div className="section active" id="sec-productos">
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
              )}

              {/* RESEÑAS */}
              {activeSection === 'resenas' && (
                <div className="section active" id="sec-resenas">
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
                            <td data-label={t('admin.user', 'Usuario')}>{r.compradorNombre || r.usuario || r.nombreUsuario || '—'}</td>
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
              )}

              {/* FIDEICOMISO (ESCROW) */}
              {activeSection === 'escrow' && (
                <div className="section active" id="sec-escrow">
                  <div className="table-header"><h3 className="card-title">💳 Transacciones en Fideicomiso</h3></div>
                  <div className="table-wrap">
                    <table className="table-responsive">
                      <thead>
                        <tr>
                          <th>Pago ID</th>
                          <th>Pedido ID</th>
                          <th>Monto</th>
                          <th>Método</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagosFideicomiso.length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No hay transacciones retenidas en fideicomiso.</td>
                          </tr>
                        ) : (
                          pagosFideicomiso.map((p) => (
                            <tr key={p.id}>
                              <td data-label="Pago ID">#{p.id}</td>
                              <td data-label="Pedido ID">#{p.pedidoId}</td>
                              <td data-label="Monto">${Number(p.monto).toLocaleString('es-CO')}</td>
                              <td data-label="Método">{p.metodoPago}</td>
                              <td data-label="Estado"><span className="badge-status status-pending">{p.estado}</span></td>
                              <td data-label="Acciones">
                                <button className="btn btn-primary btn-sm" onClick={() => liberarPago(p.id)}>
                                  Liberar Fondos
                                </button>
                                <button className="btn btn-secondary btn-sm" style={{ color: 'var(--red)', marginLeft: '6px' }} onClick={() => reembolsarPago(p.id)}>
                                  Reembolsar
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
            {/* Profile Details Form */}
            <div className="card-table" style={{ padding: '24px', borderRadius: '12px', background: 'var(--card-bg)' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>Datos Personales</h3>
              {perfilMsg.text && (
                <div style={{ padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem', background: perfilMsg.type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)', color: perfilMsg.type === 'success' ? 'var(--primary)' : 'var(--red)' }}>
                  {perfilMsg.text}
                </div>
              )}
              <form onSubmit={handleUpdatePerfil}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Nombre del Administrador</label>
                  <input className="form-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }} value={perfilForm.nombre} onChange={(e) => setPerfilForm({ ...perfilForm, nombre: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Teléfono de Soporte</label>
                  <input className="form-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }} value={perfilForm.telefono} onChange={(e) => setPerfilForm({ ...perfilForm, telefono: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Correo de Soporte (No editable)</label>
                  <input className="form-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px', background: 'var(--border-light)', cursor: 'not-allowed' }} value={user?.email || ''} readOnly />
                </div>
                <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Guardar Cambios</button>
              </form>
            </div>

            {/* Password Change Form */}
            <div className="card-table" style={{ padding: '24px', borderRadius: '12px', background: 'var(--card-bg)' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>Seguridad de la Cuenta</h3>
              {pwMsg.text && (
                <div style={{ padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem', background: pwMsg.type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)', color: pwMsg.type === 'success' ? 'var(--primary)' : 'var(--red)' }}>
                  {pwMsg.text}
                </div>
              )}
              <form onSubmit={handleUpdatePassword}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Contraseña Actual</label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" type={showCurrentPassword ? "text" : "password"} style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }} value={pwForm.contrasenaActual} onChange={(e) => setPwForm({ ...pwForm, contrasenaActual: e.target.value })} />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                    >
                      {showCurrentPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Nueva Contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" type={showNewPassword ? "text" : "password"} style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }} value={pwForm.nuevaContrasena} onChange={(e) => setPwForm({ ...pwForm, nuevaContrasena: e.target.value })} />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>
                <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Cambiar Contraseña</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

