import { useState, useEffect } from 'react';
import useStyles from '../hooks/useStyles';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import api from '../utils/api';

const TIPOS = ['Banano', 'Piña', 'Mango', 'Maracuyá', 'Guanábana', 'Naranja', 'Coco', 'Limón'];

export default function DashboardProductor() {
  useStyles(["/css/styles.css"]);
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('resumen');
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nombre: '', tipo: 'Banano', precio: '', stock: '', descripcion: '' });

  const iniciales = (user?.nombre || 'LP').charAt(0).toUpperCase() + (user?.apellido || 'P').charAt(0).toUpperCase();

  useEffect(() => {
    loadProductos();
    loadPedidos();
  }, []);

  const loadProductos = async () => {
    try {
      const data = await api.get('/productos/mis-productos');
      setProductos(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error('Error loadProductos:', err);
      setProductos([]);
    }
  };

  const loadPedidos = async () => {
    try {
      const data = await api.get('/pedidos/recibidos');
      setPedidos(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error('Error loadPedidos:', err);
      setPedidos([]);
    }
  };

  const openProductoModal = (prod = null) => {
    if (prod) {
      setEditId(prod.id);
      setForm({ nombre: prod.nombre, tipo: prod.tipo, precio: prod.precio, stock: prod.stock, descripcion: prod.descripcion || '' });
    } else {
      setEditId(null);
      setForm({ nombre: '', tipo: 'Banano', precio: '', stock: '', descripcion: '' });
    }
    setModalOpen(true);
  };

  const closeProductoModal = () => setModalOpen(false);

  const guardarProducto = async () => {
    try {
      if (editId) {
        await api.put(`/productos/${editId}`, form);
      } else {
        await api.post('/productos', form);
      }
      closeProductoModal();
      loadProductos();
    } catch (err) {
      alert(t('dashboardProductor.errorSave', 'Error al guardar: ') + (err.message || 'Inténtalo de nuevo.'));
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm(t('dashboardProductor.confirmDelete', '¿Eliminar este producto?'))) return;
    try {
      await api.delete(`/productos/${id}`);
      loadProductos();
    } catch (err) {
      alert(t('dashboardProductor.errorDelete', 'Error al eliminar: ') + err.message);
    }
  };

  const badgeClass = (estado) => {
    const e = estado?.toLowerCase();
    if (e === 'pendiente') return 'badge-status status-pending';
    if (e === 'enviado') return 'badge-status status-shipped';
    if (e === 'entregado') return 'badge-status status-delivered';
    return 'badge-status';
  };

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-user">
          <div className="avatar avatar-green" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>{iniciales}</div>
          <div className="sidebar-user-info">
            <span className="name">{user?.nombre || 'Luis Palacios'}</span>
            <span className="role">{t('dashboardProductor.producerRole', 'Productor ASAFRUT')}</span>
            <div className="rating">⭐ 4.9 ({t('dashboardProductor.reviewsCount', '120 reseñas')})</div>
          </div>
        </div>

        <div className="sidebar-label">{t('dashboardProductor.nav.title', 'Gestión Comercial')}</div>
        <a href="#" className={`sidebar-link${activeSection === 'resumen' ? ' active' : ''}`} id="link-resumen" onClick={(e) => { e.preventDefault(); setActiveSection('resumen'); }}>
          <span className="icon">📊</span> {t('dashboardProductor.nav.summary', 'Panel General')}
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'misProductos' ? ' active' : ''}`} id="link-misProductos" onClick={(e) => { e.preventDefault(); setActiveSection('misProductos'); }}>
          <span className="icon">📦</span> {t('dashboardProductor.nav.inventory', 'Inventario')}
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'pedidosRec' ? ' active' : ''}`} id="link-pedidosRec" onClick={(e) => { e.preventDefault(); setActiveSection('pedidosRec'); }}>
          <span className="icon">🧾</span> {t('dashboardProductor.nav.sales', 'Ventas')} <span className="badge-count">{pedidos.length}</span>
        </a>

        <div className="sidebar-divider"></div>
        <div className="sidebar-label">{t('dashboardProductor.logistics.title', 'Logística')}</div>
        <Link to="/envios" className="sidebar-link"><span className="icon">🚚</span> {t('dashboardProductor.logistics.dispatch', 'Despachos')}</Link>
        <Link to="/mensajeria" className="sidebar-link"><span className="icon">💬</span> {t('dashboardProductor.logistics.messaging', 'Mensajería')}</Link>

        <a href="#" className="sidebar-link" style={{ marginTop: 'auto', color: 'var(--red)' }} onClick={async (e) => { e.preventDefault(); await logout(); navigate('/login'); }}>
          <span className="icon">🔒</span> {t('dashboardProductor.logistics.logout', 'Cerrar sesión')}
        </a>
      </aside>

      <main className="main-content">
        {/* Language Switcher Dropdown */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <LanguageSwitcher />
        </div>

        {/* RESUMEN */}
        <div className={`section${activeSection === 'resumen' ? ' active' : ''}`} id="sec-resumen">
          <div className="dash-header">
            <div className="dash-welcome">
              <h1>{t('dashboardProductor.welcome', '¡Excelente día, {{name}}! 👨‍🌾', { name: user?.nombre || 'Luis' })}</h1>
              <p>{t('dashboardProductor.sub', 'Tu cosecha está teniendo un gran rendimiento este mes en Urabá.')}</p>
            </div>
            <button className="btn-cta" onClick={() => openProductoModal()}>{t('dashboardProductor.publishProduct', 'Publicar Producto +')}</button>
          </div>

          <div className="stats-grid">
            <div className="stat-card color-1">
              <span className="stat-icon-lg">📦</span>
              <div className="stat-label">{t('dashboardProductor.stats.activeProducts', 'Productos Activos')}</div>
              <div className="stat-value">{String(productos.length).padStart(2, '0')}</div>
              <div className="stat-trend">{t('dashboardProductor.stats.trendProducts', 'En venta ahora')}</div>
              <div className="stat-progress"><div className="stat-progress-bar" style={{ width: '100%' }}></div></div>
            </div>
            <div className="stat-card color-2">
              <span className="stat-icon-lg">🧾</span>
              <div className="stat-label">{t('dashboardProductor.stats.monthlySales', 'Ventas del Mes')}</div>
              <div className="stat-value">{String(pedidos.length).padStart(2, '0')}</div>
              <div className="stat-trend up">{t('dashboardProductor.stats.trendSales', '↑ 8 pedidos nuevos')}</div>
              <div className="stat-progress"><div className="stat-progress-bar" style={{ width: '60%', background: 'var(--blue)' }}></div></div>
            </div>
            <div className="stat-card color-3">
              <span className="stat-icon-lg">💰</span>
              <div className="stat-label">{t('dashboardProductor.stats.totalEarnings', 'Ingresos Totales')}</div>
              <div className="stat-value">${pedidos.reduce((sum, p) => sum + Number(p.total || 0), 0).toLocaleString('es-CO')}</div>
              <div className="stat-trend up">{t('dashboardProductor.stats.trendEarnings', 'Ingresos confirmados')}</div>
              <div className="stat-progress"><div className="stat-progress-bar" style={{ width: '75%', background: 'var(--gold)' }}></div></div>
            </div>
            <div className="stat-card color-4">
              <span className="stat-icon-lg">⭐</span>
              <div className="stat-label">{t('dashboardProductor.stats.rating', 'Calificación')}</div>
              <div className="stat-value">{user?.calificacion || '0.0'}</div>
              <div className="stat-trend">{t('dashboardProductor.stats.trendRating', 'Basado en reseñas')}</div>
              <div className="stat-progress"><div className="stat-progress-bar" style={{ width: '98%', background: '#a855f7' }}></div></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <div className="card-table">
              <div className="table-header"><h3 className="card-title">🧾 {t('dashboardProductor.recentSales', 'Últimas ventas')}</h3></div>
              <div className="table-wrap">
                <table className="table-responsive">
                  <thead>
                    <tr>
                      <th>{t('dashboardProductor.order', 'Pedido')}</th>
                      <th>{t('dashboardProductor.buyer', 'Comprador')}</th>
                      <th>{t('dashboardProductor.total', 'Total')}</th>
                      <th>{t('dashboardProductor.status', 'Estado')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.slice(0, 5).map((p) => (
                      <tr key={p.id}>
                        <td data-label={t('dashboardProductor.order', 'Pedido')}>#{p.id}</td>
                        <td data-label={t('dashboardProductor.buyer', 'Comprador')}>{p.comprador || p.nombreComprador || '—'}</td>
                        <td data-label={t('dashboardProductor.total', 'Total')}>${Number(p.total).toLocaleString('es-CO')}</td>
                        <td data-label={t('dashboardProductor.status', 'Estado')}><span className={badgeClass(p.estado)}>{t('pedidos.status.' + p.estado?.toLowerCase(), p.estado)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-table" style={{ padding: '24px' }}>
              <h3 className="card-title">{t('dashboardProductor.salesByProduct', '📊 Ventas x Producto')}</h3>
              <div className="chart-container">
                <div className="chart-bar" style={{ height: '80%' }} data-label="Banano"></div>
                <div className="chart-bar" style={{ height: '40%', background: 'var(--gold)' }} data-label="Mango"></div>
                <div className="chart-bar" style={{ height: '20%', background: 'var(--blue)' }} data-label="Coco"></div>
              </div>
            </div>
          </div>
        </div>

        {/* MIS PRODUCTOS */}
        <div className={`section${activeSection === 'misProductos' ? ' active' : ''}`} id="sec-misProductos">
          <div className="dash-header">
            <h1>{t('dashboardProductor.nav.inventory', 'Mi Inventario')}</h1>
            <button className="btn-cta" onClick={() => openProductoModal()}>{t('dashboardProductor.newProduct', '+ Nuevo Producto')}</button>
          </div>
          <div className="card-table">
            <div className="table-wrap">
              <table className="table-responsive">
                <thead>
                  <tr>
                    <th>{t('dashboardProductor.product', 'Producto')}</th>
                    <th>{t('dashboardProductor.type', 'Tipo')}</th>
                    <th>{t('dashboardProductor.pricePerKg', 'Precio/kg')}</th>
                    <th>{t('dashboardProductor.stock', 'Stock')}</th>
                    <th>{t('dashboardProductor.status', 'Estado')}</th>
                    <th>{t('dashboardProductor.actions', 'Acciones')}</th>
                  </tr>
                </thead>
                <tbody id="tbMisProductos">
                  {productos.map((p) => (
                    <tr key={p.id}>
                      <td data-label={t('dashboardProductor.product', 'Producto')}>{p.nombre}</td>
                      <td data-label={t('dashboardProductor.type', 'Tipo')}>{p.tipo}</td>
                      <td data-label={t('dashboardProductor.pricePerKg', 'Precio/kg')}>${Number(p.precio).toLocaleString('es-CO')}</td>
                      <td data-label={t('dashboardProductor.stock', 'Stock')}>{p.stock} kg</td>
                      <td data-label={t('dashboardProductor.status', 'Estado')}><span className="badge-status status-shipped">{t('dashboardProductor.active', 'Activo')}</span></td>
                      <td data-label={t('dashboardProductor.actions', 'Acciones')}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openProductoModal(p)}>{t('dashboardProductor.edit', '✏️ Editar')}</button>
                        <button className="btn btn-secondary btn-sm" style={{ color: 'var(--red)', marginLeft: '6px' }} onClick={() => eliminarProducto(p.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PEDIDOS RECIBIDOS */}
        <div className={`section${activeSection === 'pedidosRec' ? ' active' : ''}`} id="sec-pedidosRec">
          <div className="dash-header"><h1>{t('dashboardProductor.nav.sales', 'Gestión de Ventas')}</h1></div>
          <div className="card-table">
            <div className="table-filters"><div className="search-box"><input type="text" placeholder={t('dashboardProductor.searchOrder', 'Buscar pedido...')} /></div></div>
            <div className="table-wrap">
              <table className="table-responsive">
                <thead>
                  <tr>
                    <th>{t('pedidos.id', 'ID')}</th>
                    <th>{t('pedidos.product', 'Producto')}</th>
                    <th>{t('dashboardProductor.buyer', 'Comprador')}</th>
                    <th>{t('dashboardProductor.quantityHeader', 'Cant.')}</th>
                    <th>{t('pedidos.total', 'Total')}</th>
                    <th>{t('pedidos.statusHeader', 'Estado')}</th>
                    <th>{t('pedidos.actions', 'Acciones')}</th>
                  </tr>
                </thead>
                <tbody id="tbPedidosRec">
                  {pedidos.map((p) => (
                    <tr key={p.id}>
                      <td data-label={t('pedidos.id', 'ID')}>#{p.id}</td>
                      <td data-label={t('pedidos.product', 'Producto')}>{p.producto || p.nombreProducto || '—'}</td>
                      <td data-label={t('dashboardProductor.buyer', 'Comprador')}>{p.comprador || p.nombreComprador || '—'}</td>
                      <td data-label={t('dashboardProductor.quantityHeader', 'Cant.')}>{p.cantidad} kg</td>
                      <td data-label={t('pedidos.total', 'Total')}>${Number(p.total).toLocaleString('es-CO')}</td>
                      <td data-label={t('pedidos.statusHeader', 'Estado')}><span className={badgeClass(p.estado)}>{t('pedidos.status.' + p.estado?.toLowerCase(), p.estado)}</span></td>
                      <td data-label={t('pedidos.actions', 'Acciones')}>
                        <select className="form-select" style={{ width: '140px' }} onChange={async (e) => {
                          try { await api.put(`/pedidos/${p.id}/estado`, { estado: e.target.value }); loadPedidos(); }
                          catch (err) { alert(err.message); }
                        }}>
                          <option>{t('dashboardProductor.changeState', 'Cambiar estado')}</option>
                          <option value="Aceptado">{t('pedidos.status.aceptado', 'Aceptar')}</option>
                          <option value="Enviado">{t('pedidos.status.enviado', 'Enviado')}</option>
                          <option value="Entregado">{t('pedidos.status.entregado', 'Entregado')}</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL PRODUCTO */}
      {modalOpen && (
        <div className="modal-overlay open" id="modalProducto">
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editId ? t('dashboardProductor.editProduct', 'Editar producto') : t('dashboardProductor.publishNewProduct', 'Publicar nuevo producto')}</span>
              <button className="modal-close" onClick={closeProductoModal}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">{t('dashboardProductor.productName', 'Nombre del producto')}</label>
              <input className="form-input" id="pNombre" placeholder={t('dashboardProductor.placeholderName', 'Ej. Banano Urabá')} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('dashboardProductor.productType', 'Tipo de fruta')}</label>
              <select className="form-select" id="pTipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                {TIPOS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('dashboardProductor.productPrice', 'Precio/kg (COP)')}</label>
                <input className="form-input" id="pPrecio" type="number" placeholder="$ 0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('dashboardProductor.productStock', 'Stock disponible (kg)')}</label>
                <input className="form-input" id="pStock" type="number" placeholder="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('dashboardProductor.description', 'Descripción')}</label>
              <textarea className="form-textarea" id="pDesc" rows="3" placeholder={t('dashboardProductor.placeholderDesc', 'Describe la calidad, procedencia...')} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}></textarea>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={closeProductoModal}>{t('dashboardProductor.cancel', 'Cancelar')}</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={guardarProducto}>{t('dashboardProductor.save', 'Guardar producto')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

