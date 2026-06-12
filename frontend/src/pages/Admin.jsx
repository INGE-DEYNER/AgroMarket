import { useState, useEffect } from 'react';
import useStyles from '../hooks/useStyles';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Admin() {
  useStyles(["/css/styles.css"]);
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
    if (!window.confirm('¿Eliminar este producto?')) return;
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
            <span className="name">Administrador</span>
            <span className="role">Soporte AgroMarket</span>
          </div>
        </div>

        <div className="sidebar-label">Panel de Control</div>
        <a href="#" className={`sidebar-link${activeSection === 'usuarios' ? ' active' : ''}`} id="link-usuarios" onClick={(e) => { e.preventDefault(); setActiveSection('usuarios'); }}>
          <span className="icon">👥</span> Usuarios
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'productos' ? ' active' : ''}`} id="link-productos" onClick={(e) => { e.preventDefault(); setActiveSection('productos'); }}>
          <span className="icon">📦</span> Productos
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'resenas' ? ' active' : ''}`} id="link-resenas" onClick={(e) => { e.preventDefault(); setActiveSection('resenas'); }}>
          <span className="icon">⭐</span> Moderación
        </a>

        <div className="sidebar-divider"></div>
        <div className="sidebar-label">Reportes</div>
        <a href="#" className="sidebar-link"><span className="icon">📈</span> Finanzas</a>
        <a href="#" className="sidebar-link"><span className="icon">🚛</span> Logística</a>

        <a href="#" className="sidebar-link" style={{ marginTop: 'auto', color: 'var(--red)' }} onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
          <span className="icon">🔒</span> Cerrar sesión
        </a>
      </aside>

      <main className="main-content">
        <div className="dash-header">
          <div className="dash-welcome">
            <h1>Panel de Administración 🛠️</h1>
            <p>Monitoreo global de la plataforma AgroMarket Urabá</p>
          </div>
          <button className="btn-cta" style={{ background: 'var(--primary-dark)' }} onClick={() => alert('Generando reporte PDF...')}>
            Generar Reporte Mensual 📊
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card color-1">
            <span className="stat-icon-lg">👥</span>
            <div className="stat-label">Total Usuarios</div>
            <div className="stat-value" id="statUsuarios">{String(usuarios.length || 7).padStart(2, '0')}</div>
            <div className="stat-trend up">↑ 2 nuevos hoy</div>
          </div>
          <div className="stat-card color-2">
            <span className="stat-icon-lg">📦</span>
            <div className="stat-label">Productos Globales</div>
            <div className="stat-value" id="statProductos">{String(productos.length || 12).padStart(2, '0')}</div>
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
            <div className="stat-value" id="statResenas">{String(resenas.filter(r => !r.aprobada).length || 2).padStart(2, '0')}</div>
            <div className="stat-trend down" style={{ color: 'orange' }}>Acción requerida</div>
          </div>
        </div>

        <div className="grid-columns" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div className="card-table">
            {/* USUARIOS */}
            <div className={`section${activeSection === 'usuarios' ? ' active' : ''}`} id="sec-usuarios">
              <div className="table-header"><h3 className="card-title">👥 Gestión de Usuarios</h3></div>
              <div className="table-filters">
                <div className="search-box">
                  <input type="text" id="searchUsuarios" placeholder="Buscar por nombre o correo..." value={searchUsuarios} onChange={(e) => setSearchUsuarios(e.target.value)} />
                </div>
              </div>
              <div className="table-wrap">
                <table className="table-responsive">
                  <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
                  <tbody id="tbUsuarios">
                    {usuariosFiltrados.map((u) => (
                      <tr key={u.id}>
                        <td data-label="Nombre">{u.nombre} {u.apellido}</td>
                        <td data-label="Correo">{u.email}</td>
                        <td data-label="Rol"><span className="badge-status">{u.role || u.rol}</span></td>
                        <td data-label="Estado"><span className={`badge-status ${u.activo !== false ? 'status-shipped' : 'status-pending'}`}>{u.activo !== false ? 'Activo' : 'Inactivo'}</span></td>
                        <td data-label="Acciones">
                          <button className="btn btn-secondary btn-sm" onClick={() => desactivarUsuario(u.id)}>
                            {u.activo !== false ? 'Desactivar' : 'Activar'}
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
              <div className="table-header"><h3 className="card-title">📦 Inventario Global</h3></div>
              <div className="table-wrap">
                <table className="table-responsive">
                  <thead><tr><th>Producto</th><th>Productor</th><th>Precio/kg</th><th>Stock</th><th>Acciones</th></tr></thead>
                  <tbody id="tbProductos">
                    {productos.map((p) => (
                      <tr key={p.id}>
                        <td data-label="Producto">{p.nombre}</td>
                        <td data-label="Productor">{p.productor || p.nombreProductor || '—'}</td>
                        <td data-label="Precio/kg">${Number(p.precio).toLocaleString('es-CO')}</td>
                        <td data-label="Stock">{p.stock} kg</td>
                        <td data-label="Acciones">
                          <button className="btn btn-secondary btn-sm" style={{ color: 'var(--red)' }} onClick={() => eliminarProducto(p.id)}>🗑️ Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RESEÑAS */}
            <div className={`section${activeSection === 'resenas' ? ' active' : ''}`} id="sec-resenas">
              <div className="table-header"><h3 className="card-title">⭐ Moderación de Reseñas</h3></div>
              <div className="table-wrap">
                <table className="table-responsive">
                  <thead><tr><th>Usuario</th><th>Calificación</th><th>Comentario</th><th>Estado</th><th>Acciones</th></tr></thead>
                  <tbody id="tbResenas">
                    {resenas.map((r) => (
                      <tr key={r.id}>
                        <td data-label="Usuario">{r.usuario || r.nombreUsuario || '—'}</td>
                        <td data-label="Calificación">{'★'.repeat(r.calificacion || 5)}</td>
                        <td data-label="Comentario">{r.comentario}</td>
                        <td data-label="Estado"><span className={`badge-status ${r.aprobada ? 'status-shipped' : 'status-pending'}`}>{r.aprobada ? 'Aprobada' : 'Pendiente'}</span></td>
                        <td data-label="Acciones">
                          <button className="btn btn-secondary btn-sm" onClick={() => moderarResena(r.id, true)}>✅ Aprobar</button>
                          <button className="btn btn-secondary btn-sm" style={{ color: 'var(--red)', marginLeft: '6px' }} onClick={() => moderarResena(r.id, false)}>❌ Rechazar</button>
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
              <h3 className="card-title" style={{ marginBottom: '16px' }}>Top Productores 🏆</h3>
              <ul style={{ listStyle: 'none' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span>Luis Palacios</span><span style={{ fontWeight: '600', color: 'var(--primary)' }}>$1.2M</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span>Ana Córdoba</span><span style={{ fontWeight: '600', color: 'var(--primary)' }}>$980K</span>
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
