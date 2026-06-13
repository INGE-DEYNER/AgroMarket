import { useState, useEffect, useRef } from 'react';
import useStyles from '../hooks/useStyles';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import api from '../utils/api';

const TIPOS = ['Banano', 'Piña', 'Mango', 'Maracuyá', 'Guanábana', 'Naranja', 'Coco', 'Limón'];

export default function DashboardProductor() {
  useStyles([
    "/css/styles.css",
    "/css/envios.css",
    "/css/mensajeria.css"
  ]);
  const { t } = useTranslation();
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation state
  const [activeSection, setActiveSection] = useState('resumen');

  // Product and sales state
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nombre: '', tipo: 'Banano', precio: '', stock: '', descripcion: '' });

  // Shipments (Despachos) state
  const [shipments, setShipments] = useState([]);
  const [updateShipmentModalOpen, setUpdateShipmentModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [updateShipmentForm, setUpdateShipmentForm] = useState({ transportista: '', guia: '', fechaEstimadaEntrega: '', estado: '' });

  // Chat/Mensajeria state
  const [contactos, setContactos] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const chatRef = useRef(null);

  // Profile Form state
  const [perfilForm, setPerfilForm] = useState({ nombre: '', telefono: '' });
  const [pwForm, setPwForm] = useState({ contrasenaActual: '', nuevaContrasena: '' });
  const [perfilMsg, setPerfilMsg] = useState({ type: '', text: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  const iniciales = (user?.nombre || 'LP').charAt(0).toUpperCase() + (user?.apellido || 'P').charAt(0).toUpperCase();

  // Initialization
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

  // Section Loading triggers
  useEffect(() => {
    if (activeSection === 'seguimiento') {
      loadEnvios();
    } else if (activeSection === 'mensajeria') {
      loadContactos();
    } else if (activeSection === 'perfil' && user) {
      setPerfilForm({ nombre: user.nombre || '', telefono: user.telefono || '' });
      setPerfilMsg({ type: '', text: '' });
      setPwMsg({ type: '', text: '' });
    }
  }, [activeSection, user]);

  // Shipments loading
  const loadEnvios = async () => {
    try {
      const data = await api.get('/envios/mis-despachos');
      setShipments(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error('Error loadEnvios:', err);
      setShipments([]);
    }
  };

  const openUpdateShipment = (shipment) => {
    setSelectedShipment(shipment);
    setUpdateShipmentForm({
      transportista: shipment.transportista || '',
      guia: shipment.guia || '',
      fechaEstimadaEntrega: shipment.fechaEstimadaEntrega || '',
      estado: shipment.estado || 'Pendiente'
    });
    setUpdateShipmentModalOpen(true);
  };

  const handleUpdateShipment = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/envios/${selectedShipment.id}`, updateShipmentForm);
      setUpdateShipmentModalOpen(false);
      loadEnvios();
    } catch (err) {
      alert('Error al actualizar despacho: ' + err.message);
    }
  };

  // Messaging contacts and messages
  const loadContactos = async () => {
    try {
      const data = await api.get('/mensajeria/contactos');
      setContactos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loadContactos:', err);
      setContactos([]);
    }
  };

  const selectContact = async (contacto) => {
    setSelectedContact(contacto);
    try {
      const data = await api.get(`/mensajeria/conversacion/${contacto.id}`);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loadMessages:', err);
      setMessages([]);
    }
    setTimeout(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 100);
  };

  const sendMessage = async () => {
    if (!msgInput.trim() || !selectedContact) return;
    const msg = {
      id: Date.now(),
      texto: msgInput,
      mio: true,
      hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, msg]);
    const textToSend = msgInput;
    setMsgInput('');
    try {
      await api.post('/mensajeria/enviar', { destinatarioId: selectedContact.id, contenido: textToSend });
    } catch (err) {
      console.error('Error sending message:', err);
    }
    setTimeout(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 50);
  };

  // Profile updating
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

  // Products Modal
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
        <div className="sidebar-user" style={{ cursor: 'pointer' }} onClick={() => setActiveSection('perfil')}>
          <div className="avatar avatar-green" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>{iniciales}</div>
          <div className="sidebar-user-info">
            <span className="name">{user?.nombre || 'Luis Palacios'}</span>
            <span className="role">{t('dashboardProductor.producerRole', 'Productor ASAFRUT')}</span>
            <div className="rating">⭐ {user?.calificacion || '4.9'}</div>
          </div>
        </div>

        <div className="sidebar-label">{t('dashboardProductor.nav.title', 'Gestión Comercial')}</div>
        <a href="#" className={`sidebar-link${activeSection === 'resumen' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveSection('resumen'); }}>
          <span className="icon">📊</span> {t('dashboardProductor.nav.summary', 'Panel General')}
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'misProductos' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveSection('misProductos'); }}>
          <span className="icon">📦</span> {t('dashboardProductor.nav.inventory', 'Inventario')}
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'pedidosRec' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveSection('pedidosRec'); }}>
          <span className="icon">🧾</span> {t('dashboardProductor.nav.sales', 'Ventas')} <span className="badge-count">{pedidos.length}</span>
        </a>

        <div className="sidebar-divider"></div>
        <div className="sidebar-label">{t('dashboardProductor.logistics.title', 'Logística')}</div>
        <a href="#" className={`sidebar-link${activeSection === 'seguimiento' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveSection('seguimiento'); }}>
          <span className="icon">🚚</span> {t('dashboardProductor.logistics.dispatch', 'Despachos')}
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'mensajeria' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveSection('mensajeria'); }}>
          <span className="icon">💬</span> {t('dashboardProductor.logistics.messaging', 'Mensajería')}
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'perfil' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveSection('perfil'); }}>
          <span className="icon">👤</span> {t('profile.title', 'Mi Perfil')}
        </a>

        <a href="#" className="sidebar-link" style={{ marginTop: 'auto', color: 'var(--red)' }} onClick={async (e) => { e.preventDefault(); await logout(); navigate('/login'); }}>
          <span className="icon">🔒</span> {t('dashboardProductor.logistics.logout', 'Cerrar sesión')}
        </a>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <LanguageSwitcher />
        </div>

        {/* ─── RESUMEN ─── */}
        {activeSection === 'resumen' && (
          <div className="section active" id="sec-resumen">
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
                <div className="stat-value">{user?.calificacion || '4.9'}</div>
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
                          <td data-label="Pedido">#{p.id}</td>
                          <td data-label="Comprador">{p.comprador || p.nombreComprador || '—'}</td>
                          <td data-label="Total">${Number(p.total).toLocaleString('es-CO')}</td>
                          <td data-label="Estado"><span className={badgeClass(p.estado)}>{t('pedidos.status.' + p.estado?.toLowerCase(), p.estado)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-table" style={{ padding: '24px' }}>
                <h3 className="card-title">{t('dashboardProductor.salesByProduct', '📊 Ventas x Producto')}</h3>
                <div className="chart-container" style={{ height: '180px' }}>
                  <div className="chart-bar" style={{ height: '80%' }} data-label="Banano"></div>
                  <div className="chart-bar" style={{ height: '40%', background: 'var(--gold)' }} data-label="Mango"></div>
                  <div className="chart-bar" style={{ height: '20%', background: 'var(--blue)' }} data-label="Coco"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── INVENTARIO ─── */}
        {activeSection === 'misProductos' && (
          <div className="section active" id="sec-misProductos">
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
                  <tbody>
                    {productos.map((p) => (
                      <tr key={p.id}>
                        <td data-label="Producto">{p.nombre}</td>
                        <td data-label="Tipo">{p.tipo}</td>
                        <td data-label="Precio/kg">${Number(p.precio).toLocaleString('es-CO')}</td>
                        <td data-label="Stock">{p.stock} kg</td>
                        <td data-label="Estado"><span className="badge-status status-shipped">{t('dashboardProductor.active', 'Activo')}</span></td>
                        <td data-label="Acciones">
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
        )}

        {/* ─── VENTAS ─── */}
        {activeSection === 'pedidosRec' && (
          <div className="section active" id="sec-pedidosRec">
            <div className="dash-header"><h1>{t('dashboardProductor.nav.sales', 'Gestión de Ventas')}</h1></div>
            <div className="card-table">
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
                  <tbody>
                    {pedidos.map((p) => (
                      <tr key={p.id}>
                        <td data-label="ID">#{p.id}</td>
                        <td data-label="Producto">{p.producto || p.nombreProducto || '—'}</td>
                        <td data-label="Comprador">{p.comprador || p.nombreComprador || '—'}</td>
                        <td data-label="Cant.">{p.cantidad} kg</td>
                        <td data-label="Total">${Number(p.total).toLocaleString('es-CO')}</td>
                        <td data-label="Estado"><span className={badgeClass(p.estado)}>{t('pedidos.status.' + p.estado?.toLowerCase(), p.estado)}</span></td>
                        <td data-label="Acciones">
                          <select className="form-select" style={{ width: '140px' }} onChange={async (e) => {
                            try {
                              await api.put(`/pedidos/${p.id}/estado`, { estado: e.target.value });
                              loadPedidos();
                            } catch (err) { alert(err.message); }
                          }}>
                            <option>{t('dashboardProductor.changeState', 'Cambiar estado')}</option>
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
        )}

        {/* ─── DESPACHOS (PRODUCTOR ENVIOS) ─── */}
        {activeSection === 'seguimiento' && (
          <div className="section active">
            <div className="dash-header">
              <h1>🚚 Gestión de Despachos</h1>
              <p>Monitorea y actualiza la información de entrega de tus productos vendidos</p>
            </div>

            <div className="card-table" style={{ marginTop: '20px' }}>
              <div className="table-wrap">
                <table className="table-responsive">
                  <thead>
                    <tr>
                      <th>Pedido ID</th>
                      <th>Producto</th>
                      <th>Destino</th>
                      <th>Transportista</th>
                      <th>Guía de Envío</th>
                      <th>Fecha Estimada</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map((s) => (
                      <tr key={s.id}>
                        <td data-label="Pedido ID">#{s.pedidoId || s.id}</td>
                        <td data-label="Producto">{s.producto || '—'}</td>
                        <td data-label="Destino">{s.direccionDestino || '—'}</td>
                        <td data-label="Transportista">{s.transportista || '—'}</td>
                        <td data-label="Guía">{s.guia || '—'}</td>
                        <td data-label="Fecha Estimada">{s.fechaEstimadaEntrega || '—'}</td>
                        <td data-label="Estado"><span className={badgeClass(s.estado)}>{s.estado}</span></td>
                        <td data-label="Acciones">
                          <button className="btn btn-secondary btn-sm" onClick={() => openUpdateShipment(s)}>✏️ Actualizar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── MENSAJERIA ─── */}
        {activeSection === 'mensajeria' && (
          <div className="section active">
            <div className="chat-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden', height: '600px' }}>
              {/* CONTACTS */}
              <div className="chat-contacts" style={{ borderRight: '1px solid var(--border-light)', overflowY: 'auto' }}>
                {contactos.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No tienes contactos activos.</div>
                ) : (
                  contactos.map((c) => (
                    <div
                      key={c.id}
                      className={`contact-item${selectedContact?.id === c.id ? ' active' : ''}`}
                      onClick={() => selectContact(c)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)', background: selectedContact?.id === c.id ? 'var(--primary-bg)' : 'transparent' }}
                    >
                      <div className="avatar avatar-blue">{c.nombre?.charAt(0).toUpperCase() || 'C'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{c.nombre}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('auth.' + c.rol?.toLowerCase(), c.rol)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* WINDOW */}
              <div className="chat-window" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="chat-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
                  <div className="avatar avatar-blue">{selectedContact?.nombre?.charAt(0).toUpperCase() || '--'}</div>
                  <div>
                    <div className="chat-name" style={{ fontWeight: '700' }}>{selectedContact?.nombre || 'Selecciona un contacto'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedContact?.rol || ''}</div>
                  </div>
                </div>

                <div className="chat-messages" ref={chatRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {!selectedContact ? (
                    <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: '2.5rem' }}>💬</div>
                      <div>Selecciona un contacto para iniciar la conversación.</div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ margin: 'auto', color: 'var(--text-muted)' }}>No hay mensajes aún. ¡Sé el primero en escribir!</div>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: m.mio ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '70%', background: m.mio ? 'var(--primary)' : 'var(--card-bg)', color: m.mio ? '#fff' : 'inherit', padding: '10px 14px', borderRadius: m.mio ? '16px 16px 4px 16px' : '16px 16px 16px 4px', border: m.mio ? 'none' : '1px solid var(--border-light)' }}>
                          <div>{m.texto || m.contenido}</div>
                          <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>{m.hora || new Date(m.fechaEnvio).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="chat-input-bar" style={{ padding: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '12px' }}>
                  <input
                    className="chat-input"
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                    placeholder="Escribe un mensaje..."
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                    disabled={!selectedContact}
                  />
                  <button className="btn btn-primary" onClick={sendMessage} disabled={!selectedContact}>Enviar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── MI PERFIL & AJUSTES ─── */}
        {activeSection === 'perfil' && (
          <div className="section active">
            <div className="dash-header">
              <div className="dash-welcome">
                <h1>👤 Ajustes de Mi Perfil</h1>
                <p>Administra tu información de agricultor y credenciales de acceso</p>
              </div>
            </div>

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
                    <label className="form-label">Nombre del Productor</label>
                    <input className="form-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }} value={perfilForm.nombre} onChange={(e) => setPerfilForm({ ...perfilForm, nombre: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Teléfono de Contacto</label>
                    <input className="form-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }} value={perfilForm.telefono} onChange={(e) => setPerfilForm({ ...perfilForm, telefono: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label">Correo ASAFRUT (No editable)</label>
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
                    <input className="form-input" type="password" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }} value={pwForm.contrasenaActual} onChange={(e) => setPwForm({ ...pwForm, contrasenaActual: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label">Nueva Contraseña</label>
                    <input className="form-input" type="password" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }} value={pwForm.nuevaContrasena} onChange={(e) => setPwForm({ ...pwForm, nuevaContrasena: e.target.value })} />
                  </div>
                  <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Cambiar Contraseña</button>
                </form>
              </div>
            </div>
          </div>
        )}
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

      {/* MODAL UPDATE DESPACHO */}
      {updateShipmentModalOpen && (
        <div className="modal-overlay open">
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <span className="modal-title">Actualizar Envío / Despacho</span>
              <button className="modal-close" onClick={() => setUpdateShipmentModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateShipment}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Empresa Transportista</label>
                <input className="form-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }} placeholder="Ej. Servientrega, Envia" value={updateShipmentForm.transportista} onChange={(e) => setUpdateShipmentForm({ ...updateShipmentForm, transportista: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Número de Guía</label>
                <input className="form-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }} placeholder="Ej. 1029384756" value={updateShipmentForm.guia} onChange={(e) => setUpdateShipmentForm({ ...updateShipmentForm, guia: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Fecha Estimada de Entrega</label>
                <input className="form-input" type="date" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }} value={updateShipmentForm.fechaEstimadaEntrega} onChange={(e) => setUpdateShipmentForm({ ...updateShipmentForm, fechaEstimadaEntrega: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Estado del Envío</label>
                <select className="form-select" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }} value={updateShipmentForm.estado} onChange={(e) => setUpdateShipmentForm({ ...updateShipmentForm, estado: e.target.value })}>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Preparando">Preparando</option>
                  <option value="En tránsito">En tránsito</option>
                  <option value="Entregado">Entregado</option>
                </select>
              </div>
              <div className="modal-footer" style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" type="button" onClick={() => setUpdateShipmentModalOpen(false)}>Cancelar</button>
                <button className="btn btn-primary" type="submit">Actualizar Despacho</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
