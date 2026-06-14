import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import api from '../utils/api';
import '../styles/envios.css';
import '../styles/mensajeria.css';

const TIPOS = ['Banano', 'Piña', 'Mango', 'Maracuyá', 'Guanábana', 'Naranja', 'Coco', 'Limón'];

export default function DashboardProductor() {
  const { t } = useTranslation();
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
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation state
  const [activeSection, setActiveSection] = useState('resumen');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sec = params.get('section');
    if (sec) {
      setActiveSection(sec);
    }
  }, [location.search]);

  // Product and sales state
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nombre: '', tipo: 'Banano', precio: '', stock: '', descripcion: '', imagenUrl: '', cantidadMinimaMayorista: '', precioMayorista: '' });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');

  // RFQ (Licitaciones) states
  const [activeRfqs, setActiveRfqs] = useState([]);
  const [biddingRfq, setBiddingRfq] = useState(null);
  const [bidForm, setBidForm] = useState({ precioPropuesto: '', comentarios: '' });
  const [bidMsg, setBidMsg] = useState({ type: '', text: '' });

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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const iniciales = (user?.nombre || 'LP').charAt(0).toUpperCase() + (user?.apellido || 'P').charAt(0).toUpperCase();

  // Initialization
  useEffect(() => {
    loadProductos();
    loadPedidos();
  }, []);

  const loadProductos = async () => {
    try {
      const data = await api.get('/productos/mis-productos');
      const items = extractArray(data).map(p => ({
        ...p,
        tipo: p.tipo || p.tipoFruta || 'Banano',
        stock: p.stock !== undefined ? p.stock : p.cantidadDisponible
      }));
      setProductos(items);
    } catch (err) {
      console.error('Error loadProductos:', err);
      setProductos([]);
    }
  };

  const loadPedidos = async () => {
    try {
      const data = await api.get('/pedidos/mis-pedidos');
      setPedidos(extractArray(data));
    } catch (err) {
      console.error('Error loadPedidos:', err);
      setPedidos([]);
    }
  };

  const loadActiveRfqs = async () => {
    try {
      const data = await api.get('/rfq/activas');
      setActiveRfqs(extractArray(data));
    } catch (err) {
      console.error('Error loadActiveRfqs:', err);
      setActiveRfqs([]);
    }
  };

  const enviarBid = async (e) => {
    e.preventDefault();
    setBidMsg({ type: '', text: '' });
    if (!bidForm.precioPropuesto) {
      setBidMsg({ type: 'error', text: 'Por favor complete todos los campos obligatorios.' });
      return;
    }
    try {
      await api.post(`/rfq/${biddingRfq.id}/ofertar`, {
        precioPropuesto: parseFloat(bidForm.precioPropuesto),
        comentarios: bidForm.comentarios
      });
      setBidMsg({ type: 'success', text: 'Cotización enviada exitosamente.' });
      setBidForm({ precioPropuesto: '', comentarios: '' });
      setTimeout(() => {
        setBiddingRfq(null);
        loadActiveRfqs();
      }, 1500);
    } catch (err) {
      setBidMsg({ type: 'error', text: err.message || 'Error al enviar la cotización.' });
    }
  };

  // Section Loading triggers
  useEffect(() => {
    if (activeSection === 'seguimiento') {
      loadEnvios();
    } else if (activeSection === 'mensajeria') {
      loadContactos();
    } else if (activeSection === 'rfq') {
      loadActiveRfqs();
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
      setShipments(extractArray(data));
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
      const data = await api.get('/mensajes/contactos');
      setContactos(extractArray(data));
    } catch (err) {
      console.error('Error loadContactos:', err);
      setContactos([]);
    }
  };

  const selectContact = async (contacto) => {
    setSelectedContact(contacto);
    try {
      const data = await api.get(`/mensajes/conversacion/${contacto.id}`);
      setMessages(extractArray(data));
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
      await api.post('/mensajes', { destinatarioId: selectedContact.id, contenido: textToSend });
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
    setSelectedImageFile(null);
    setImagePreviewUrl('');
    if (prod) {
      setEditId(prod.id);
      setForm({
        nombre: prod.nombre,
        tipo: prod.tipo || prod.tipoFruta || 'Banano',
        precio: prod.precio,
        stock: prod.stock !== undefined ? prod.stock : prod.cantidadDisponible,
        descripcion: prod.descripcion || '',
        imagenUrl: prod.imagenUrl || '',
        cantidadMinimaMayorista: prod.cantidadMinimaMayorista !== undefined && prod.cantidadMinimaMayorista !== null ? prod.cantidadMinimaMayorista : '',
        precioMayorista: prod.precioMayorista !== undefined && prod.precioMayorista !== null ? prod.precioMayorista : ''
      });
      if (prod.imagenUrl) {
        // Resolve absolute url for display if relative
        const resolvedUrl = prod.imagenUrl.startsWith('http') 
          ? prod.imagenUrl 
          : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
              ? `http://localhost:8080${prod.imagenUrl}`
              : `https://agromarket-vj8x.onrender.com${prod.imagenUrl}`);
        setImagePreviewUrl(resolvedUrl);
      }
    } else {
      setEditId(null);
      setForm({ nombre: '', tipo: 'Banano', precio: '', stock: '', descripcion: '', imagenUrl: '', cantidadMinimaMayorista: '', precioMayorista: '' });
    }
    setModalOpen(true);
  };

  const closeProductoModal = () => {
    setSelectedImageFile(null);
    setImagePreviewUrl('');
    setModalOpen(false);
  };

  const guardarProducto = async () => {
    const mapTipoToEnum = (tipo) => {
      const mapping = {
        'Banano': 'BANANO',
        'Piña': 'PINA',
        'Mango': 'MANGO',
        'Maracuyá': 'MARACUYA',
        'Guanábana': 'GUANABANA',
        'Naranja': 'NARANJA',
        'Coco': 'COCO',
        'Limón': 'LIMON'
      };
      return mapping[tipo] || 'BANANO';
    };

    const payload = {
      nombre: form.nombre,
      tipoFruta: mapTipoToEnum(form.tipo),
      precio: Number(form.precio),
      cantidadDisponible: Number(form.stock),
      descripcion: form.descripcion,
      imagenUrl: form.imagenUrl || '',
      cantidadMinimaMayorista: form.cantidadMinimaMayorista ? Number(form.cantidadMinimaMayorista) : null,
      precioMayorista: form.precioMayorista ? Number(form.precioMayorista) : null
    };

    try {
      let res;
      if (editId) {
        res = await api.put(`/productos/${editId}`, payload);
      } else {
        res = await api.post('/productos', payload);
      }
      
      const savedProduct = res?.data || res;
      const productId = savedProduct?.id || editId;

      // Upload selected image file if present
      if (productId && selectedImageFile) {
        const formData = new FormData();
        formData.append('imagen', selectedImageFile);
        await api.post(`/productos/${productId}/imagen`, formData);
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
        <div className="sidebar-user" style={{ cursor: 'pointer' }} onClick={() => navigate('/perfil')}>
          <div className="avatar avatar-green" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>{iniciales}</div>
          <div className="sidebar-user-info">
            <span className="name">{user?.nombre || 'Luis Palacios'}</span>
            <span className="role">
              {t('dashboardProductor.producerRole', 'Productor ASAFRUT')}
              {user?.verificado && (
                <span style={{ display: 'inline-block', marginLeft: '6px', background: '#385723', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700' }}>
                  Verificado
                </span>
              )}
            </span>
            <div className="rating"> {user?.calificacion || '4.9'}</div>
          </div>
        </div>

        <div className="sidebar-label">{t('dashboardProductor.nav.title', 'Gestión Comercial')}</div>
        <a href="#" className={`sidebar-link${activeSection === 'resumen' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveSection('resumen'); }}>
          <span className="icon"></span> {t('dashboardProductor.nav.summary', 'Panel General')}
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'misProductos' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveSection('misProductos'); }}>
          <span className="icon"></span> {t('dashboardProductor.nav.inventory', 'Inventario')}
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'pedidosRec' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveSection('pedidosRec'); }}>
          <span className="icon"></span> {t('dashboardProductor.nav.sales', 'Ventas')} <span className="badge-count">{pedidos.length}</span>
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'rfq' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveSection('rfq'); }}>
          <span className="icon"></span> Oportunidades Comerciales
        </a>

        <div className="sidebar-divider"></div>
        <div className="sidebar-label">{t('dashboardProductor.logistics.title', 'Logística')}</div>
        <a href="#" className={`sidebar-link${activeSection === 'seguimiento' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveSection('seguimiento'); }}>
          <span className="icon"></span> {t('dashboardProductor.logistics.dispatch', 'Despachos')}
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'mensajeria' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveSection('mensajeria'); }}>
          <span className="icon"></span> {t('dashboardProductor.logistics.messaging', 'Mensajería')}
        </a>
        <Link to="/perfil" className="sidebar-link">
          <span className="icon"></span> {t('profile.title', 'Mi Perfil')}
        </Link>

        <a href="#" className="sidebar-link" style={{ marginTop: 'auto', color: 'var(--red)' }} onClick={async (e) => { e.preventDefault(); await logout(); navigate('/login'); }}>
          <span className="icon"></span> {t('dashboardProductor.logistics.logout', 'Cerrar sesión')}
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
                <h1>{t('dashboardProductor.welcome', '¡Excelente día, {{name}}!', { name: user?.nombre || 'Luis' })}</h1>
                <p>{t('dashboardProductor.sub', 'Tu cosecha está teniendo un gran rendimiento este mes en Urabá.')}</p>
              </div>
              <button className="btn-cta" onClick={() => openProductoModal()}>{t('dashboardProductor.publishProduct', 'Publicar Producto +')}</button>
            </div>

            {!user?.verificado && (
              <div style={{
                background: 'linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)',
                border: '1px solid #ffe8a1',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}></span>
                  <div>
                    <strong style={{ color: '#856404', display: 'block' }}>Tu cuenta de productor aún no está verificada</strong>
                    <span style={{ color: '#856404', fontSize: '0.85rem' }}>Completa tu información personal y cuenta bancaria para ser aprobado por el administrador.</span>
                  </div>
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate('/perfil')}
                  style={{ background: '#856404', color: '#fff', border: 'none', padding: '8px 16px' }}
                >
                  Verificar Perfil
                </button>
              </div>
            )}

            <div className="stats-grid">
              <div className="stat-card color-1">
                <span className="stat-icon-lg"></span>
                <div className="stat-label">{t('dashboardProductor.stats.activeProducts', 'Productos Activos')}</div>
                <div className="stat-value">{String(productos.length).padStart(2, '0')}</div>
              </div>
              <div className="stat-card color-2">
                <span className="stat-icon-lg"></span>
                <div className="stat-label">{t('dashboardProductor.stats.monthlySales', 'Ventas del Mes')}</div>
                <div className="stat-value">{String(pedidos.length).padStart(2, '0')}</div>
              </div>
              <div className="stat-card color-3">
                <span className="stat-icon-lg"></span>
                <div className="stat-label">{t('dashboardProductor.stats.totalEarnings', 'Ingresos Totales')}</div>
                <div className="stat-value">${pedidos.reduce((sum, p) => sum + Number(p.total || 0), 0).toLocaleString('es-CO')}</div>
              </div>
              <div className="stat-card color-4">
                <span className="stat-icon-lg"></span>
                <div className="stat-label">{t('dashboardProductor.stats.rating', 'Calificación')}</div>
                <div className="stat-value">{user?.calificacion || '4.9'}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
              <div className="card-table">
                <div className="table-header"><h3 className="card-title"> {t('dashboardProductor.recentSales', 'Últimas ventas')}</h3></div>
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
                          <button className="btn btn-secondary btn-sm" onClick={() => openProductoModal(p)}>{t('dashboardProductor.edit', 'Editar')}</button>
                          <button className="btn btn-secondary btn-sm" style={{ color: 'var(--red)', marginLeft: '6px' }} onClick={() => eliminarProducto(p.id)}></button>
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
              <h1>Gestión de Despachos</h1>
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
                          <button className="btn btn-secondary btn-sm" onClick={() => openUpdateShipment(s)}>Actualizar</button>
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
                      <div style={{ fontSize: '2.5rem' }}></div>
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
                <h1>Ajustes de Mi Perfil</h1>
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
          </div>
        )}

        {/* ─── RFQ OPPORTUNITIES (LICITACIONES) ─── */}
        {activeSection === 'rfq' && (
          <div className="section active">
            <div className="dash-header">
              <div className="dash-welcome">
                <h1>Licitaciones / Oportunidades Comerciales</h1>
                <p>Encuentra solicitudes de compra al por mayor y envía tus cotizaciones de forma segura</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: biddingRfq ? '1fr 1fr' : '1fr', gap: '24px', marginTop: '24px' }}>
              {/* Active RFQ List */}
              <div className="card-table" style={{ padding: '24px', borderRadius: '12px', background: 'var(--card-bg)' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>Licitaciones Disponibles</h3>
                {activeRfqs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>No hay licitaciones activas en este momento.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {activeRfqs.map((rfq) => {
                      const yaOferto = rfq.ofertas?.find(of => of.productorId === user?.id);
                      return (
                        <div key={rfq.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--primary)' }}>
                              {rfq.tipoFruta} - {rfq.cantidadRequerida} kg
                            </span>
                            <div style={{ fontSize: '0.8rem', margin: '4px 0' }}>Comprador: <strong>{rfq.compradorNombre}</strong></div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0' }}>{rfq.descripcion}</p>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Vence: {new Date(rfq.fechaLimite).toLocaleString()}</span>
                          </div>
                          <div>
                            {yaOferto ? (
                              <div style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem', textAlign: 'right' }}>
                                Ofertado: ${Number(yaOferto.precioPropuesto).toLocaleString('es-CO')}/kg
                              </div>
                            ) : (
                              <button className="btn btn-primary" onClick={() => { setBiddingRfq(rfq); setBidMsg({ type: '', text: '' }); }}>
                                Cotizar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bidding Panel */}
              {biddingRfq && (
                <div className="card-table" style={{ padding: '24px', borderRadius: '12px', background: 'var(--card-bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>Enviar Cotización para RFQ #{biddingRfq.id}</h3>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => setBiddingRfq(null)}>✕</button>
                  </div>
                  {bidMsg.text && (
                    <div style={{ padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem', background: bidMsg.type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)', color: bidMsg.type === 'success' ? 'var(--primary)' : 'var(--red)' }}>
                      {bidMsg.text}
                    </div>
                  )}
                  <form onSubmit={enviarBid}>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label">Detalles de la Solicitud</label>
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', fontSize: '0.8rem' }}>
                        <p><strong>Fruta solicitada:</strong> {biddingRfq.tipoFruta}</p>
                        <p><strong>Cantidad requerida:</strong> {biddingRfq.cantidadRequerida} kg</p>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label">Precio Propuesto por kg (COP) *</label>
                      <input type="number" min="1" className="form-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }} value={bidForm.precioPropuesto} onChange={(e) => setBidForm({ ...bidForm, precioPropuesto: e.target.value })} placeholder="Ej: 2200" />
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label">Comentarios / Condiciones de Entrega</label>
                      <textarea rows="3" className="form-textarea" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }} value={bidForm.comentarios} onChange={(e) => setBidForm({ ...bidForm, comentarios: e.target.value })} placeholder="Ej: Despacho inmediato, calidad premium certificada."></textarea>
                    </div>
                    <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Enviar Cotización</button>
                  </form>
                </div>
              )}
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
            
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '0 0 16px 0' }}>
              <div className="form-group">
                <label className="form-label">Cant. Mínima Mayorista (kg)</label>
                <input className="form-input" type="number" placeholder="Ej: 100" value={form.cantidadMinimaMayorista} onChange={(e) => setForm({ ...form, cantidadMinimaMayorista: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Precio Mayorista (COP)</label>
                <input className="form-input" type="number" placeholder="Ej: 2400" value={form.precioMayorista} onChange={(e) => setForm({ ...form, precioMayorista: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('dashboardProductor.description', 'Descripción')}</label>
              <textarea className="form-textarea" id="pDesc" rows="3" placeholder={t('dashboardProductor.placeholderDesc', 'Describe la calidad, procedencia...')} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}></textarea>
            </div>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">{t('dashboardProductor.image', 'Imagen del Producto')}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                {imagePreviewUrl ? (
                  <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                    <img src={imagePreviewUrl} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button 
                      type="button" 
                      onClick={() => { setSelectedImageFile(null); setImagePreviewUrl(''); setForm(prev => ({ ...prev, imagenUrl: '' })); }} 
                      style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(255, 0, 0, 0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '8px', border: '2px dashed var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '1.5rem' }}>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    type="button"
                    onClick={() => document.getElementById('product-image-input').click()}
                  >
                    {imagePreviewUrl ? t('dashboardProductor.changeImage', 'Cambiar imagen') : t('dashboardProductor.selectImage', 'Seleccionar imagen')}
                  </button>
                  <input 
                    id="product-image-input" 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSelectedImageFile(file);
                        setImagePreviewUrl(URL.createObjectURL(file));
                      }
                    }} 
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>JPG, PNG. Máx 5MB.</span>
                </div>
              </div>
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

