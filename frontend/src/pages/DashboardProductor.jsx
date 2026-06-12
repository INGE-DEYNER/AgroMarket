import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/styles.css';

const TIPOS = ['Banano', 'Piña', 'Mango', 'Maracuyá', 'Guanábana', 'Naranja', 'Coco', 'Limón'];

export default function DashboardProductor() {
  const { user } = useAuth();
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
    } catch {
      setProductos([
        { id: 1, nombre: 'Banano Urabá', tipo: 'Banano', precio: 1200, stock: 100, estado: 'Activo' },
        { id: 2, nombre: 'Mango Tommy', tipo: 'Mango', precio: 3500, stock: 80, estado: 'Activo' },
        { id: 3, nombre: 'Coco Fresco', tipo: 'Coco', precio: 2000, stock: 50, estado: 'Activo' },
      ]);
    }
  };

  const loadPedidos = async () => {
    try {
      const data = await api.get('/pedidos/recibidos');
      setPedidos(Array.isArray(data) ? data : data.content || []);
    } catch {
      setPedidos([
        { id: '001', producto: 'Banano Urabá', comprador: 'María Torres', cantidad: 70, total: 84000, estado: 'Pendiente' },
        { id: '002', producto: 'Mango Tommy', comprador: 'Jorge Restrepo', cantidad: 40, total: 140000, estado: 'Enviado' },
      ]);
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
      alert('Error al guardar: ' + (err.message || 'Inténtalo de nuevo.'));
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      loadProductos();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
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
            <span className="role">Productor ASAFRUT</span>
            <div className="rating">⭐ 4.9 (120 reseñas)</div>
          </div>
        </div>

        <div className="sidebar-label">Gestión Comercial</div>
        <a href="#" className={`sidebar-link${activeSection === 'resumen' ? ' active' : ''}`} id="link-resumen" onClick={(e) => { e.preventDefault(); setActiveSection('resumen'); }}>
          <span className="icon">📊</span> Panel General
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'misProductos' ? ' active' : ''}`} id="link-misProductos" onClick={(e) => { e.preventDefault(); setActiveSection('misProductos'); }}>
          <span className="icon">📦</span> Inventario
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'pedidosRec' ? ' active' : ''}`} id="link-pedidosRec" onClick={(e) => { e.preventDefault(); setActiveSection('pedidosRec'); }}>
          <span className="icon">🧾</span> Ventas <span className="badge-count">{pedidos.length}</span>
        </a>

        <div className="sidebar-divider"></div>
        <div className="sidebar-label">Logística</div>
        <Link to="/envios" className="sidebar-link"><span className="icon">🚚</span> Despachos</Link>
        <Link to="/mensajeria" className="sidebar-link"><span className="icon">💬</span> Mensajería</Link>

        <a href="#" className="sidebar-link" style={{ marginTop: 'auto', color: 'var(--red)' }} onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
          <span className="icon">🔒</span> Cerrar sesión
        </a>
      </aside>

      <main className="main-content">
        {/* RESUMEN */}
        <div className={`section${activeSection === 'resumen' ? ' active' : ''}`} id="sec-resumen">
          <div className="dash-header">
            <div className="dash-welcome">
              <h1>¡Excelente día, {user?.nombre || 'Luis'}! 👨‍🌾</h1>
              <p>Tu cosecha está teniendo un gran rendimiento este mes en Urabá.</p>
            </div>
            <button className="btn-cta" onClick={() => openProductoModal()}>Publicar Producto +</button>
          </div>

          <div className="stats-grid">
            <div className="stat-card color-1">
              <span className="stat-icon-lg">📦</span>
              <div className="stat-label">Productos Activos</div>
              <div className="stat-value">{String(productos.length).padStart(2, '0')}</div>
              <div className="stat-trend">En venta ahora</div>
              <div className="stat-progress"><div className="stat-progress-bar" style={{ width: '100%' }}></div></div>
            </div>
            <div className="stat-card color-2">
              <span className="stat-icon-lg">🧾</span>
              <div className="stat-label">Ventas del Mes</div>
              <div className="stat-value">{String(pedidos.length).padStart(2, '0')}</div>
              <div className="stat-trend up">↑ 8 pedidos nuevos</div>
              <div className="stat-progress"><div className="stat-progress-bar" style={{ width: '60%', background: 'var(--blue)' }}></div></div>
            </div>
            <div className="stat-card color-3">
              <span className="stat-icon-lg">💰</span>
              <div className="stat-label">Ingresos Totales</div>
              <div className="stat-value">$1.2M</div>
              <div className="stat-trend up">↑ 15% vs Abril</div>
              <div className="stat-progress"><div className="stat-progress-bar" style={{ width: '75%', background: 'var(--gold)' }}></div></div>
            </div>
            <div className="stat-card color-4">
              <span className="stat-icon-lg">⭐</span>
              <div className="stat-label">Calificación</div>
              <div className="stat-value">4.9</div>
              <div className="stat-trend">Top Vendedor Urabá</div>
              <div className="stat-progress"><div className="stat-progress-bar" style={{ width: '98%', background: '#a855f7' }}></div></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <div className="card-table">
              <div className="table-header"><h3 className="card-title">🧾 Últimas ventas</h3></div>
              <div className="table-wrap">
                <table className="table-responsive">
                  <thead><tr><th>Pedido</th><th>Comprador</th><th>Total</th><th>Estado</th></tr></thead>
                  <tbody>
                    {pedidos.slice(0, 5).map((p) => (
                      <tr key={p.id}>
                        <td data-label="Pedido">#{p.id}</td>
                        <td data-label="Comprador">{p.comprador || p.nombreComprador || '—'}</td>
                        <td data-label="Total">${Number(p.total).toLocaleString('es-CO')}</td>
                        <td data-label="Estado"><span className={badgeClass(p.estado)}>{p.estado}</span></td>
                      </tr>
                    ))}
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

        {/* MIS PRODUCTOS */}
        <div className={`section${activeSection === 'misProductos' ? ' active' : ''}`} id="sec-misProductos">
          <div className="dash-header">
            <h1>Mi Inventario</h1>
            <button className="btn-cta" onClick={() => openProductoModal()}>+ Nuevo Producto</button>
          </div>
          <div className="card-table">
            <div className="table-wrap">
              <table className="table-responsive">
                <thead><tr><th>Producto</th><th>Tipo</th><th>Precio/kg</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody id="tbMisProductos">
                  {productos.map((p) => (
                    <tr key={p.id}>
                      <td data-label="Producto">{p.nombre}</td>
                      <td data-label="Tipo">{p.tipo}</td>
                      <td data-label="Precio/kg">${Number(p.precio).toLocaleString('es-CO')}</td>
                      <td data-label="Stock">{p.stock} kg</td>
                      <td data-label="Estado"><span className="badge-status status-shipped">{p.estado || 'Activo'}</span></td>
                      <td data-label="Acciones">
                        <button className="btn btn-secondary btn-sm" onClick={() => openProductoModal(p)}>✏️ Editar</button>
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
          <div className="dash-header"><h1>Gestión de Ventas</h1></div>
          <div className="card-table">
            <div className="table-filters"><div className="search-box"><input type="text" placeholder="Buscar pedido..." /></div></div>
            <div className="table-wrap">
              <table className="table-responsive">
                <thead><tr><th>ID</th><th>Producto</th><th>Comprador</th><th>Cant.</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody id="tbPedidosRec">
                  {pedidos.map((p) => (
                    <tr key={p.id}>
                      <td data-label="ID">#{p.id}</td>
                      <td data-label="Producto">{p.producto || p.nombreProducto || '—'}</td>
                      <td data-label="Comprador">{p.comprador || p.nombreComprador || '—'}</td>
                      <td data-label="Cant.">{p.cantidad} kg</td>
                      <td data-label="Total">${Number(p.total).toLocaleString('es-CO')}</td>
                      <td data-label="Estado"><span className={badgeClass(p.estado)}>{p.estado}</span></td>
                      <td data-label="Acciones">
                        <select className="form-select" style={{ width: '140px' }} onChange={async (e) => {
                          try { await api.put(`/pedidos/${p.id}/estado`, { estado: e.target.value }); loadPedidos(); }
                          catch (err) { alert(err.message); }
                        }}>
                          <option>Cambiar estado</option>
                          <option value="Aceptado">Aceptar</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Entregado">Entregado</option>
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
              <span className="modal-title">{editId ? 'Editar producto' : 'Publicar nuevo producto'}</span>
              <button className="modal-close" onClick={closeProductoModal}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Nombre del producto</label>
              <input className="form-input" id="pNombre" placeholder="Ej. Banano Urabá" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de fruta</label>
              <select className="form-select" id="pTipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                {TIPOS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Precio/kg (COP)</label>
                <input className="form-input" id="pPrecio" type="number" placeholder="$ 0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Stock disponible (kg)</label>
                <input className="form-input" id="pStock" type="number" placeholder="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea className="form-textarea" id="pDesc" rows="3" placeholder="Describe la calidad, procedencia..." value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}></textarea>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={closeProductoModal}>Cancelar</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={guardarProducto}>Guardar producto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
