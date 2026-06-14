import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import api from '../utils/api';
import { useCart } from '../hooks/useCart';
import '../styles/catalogo.css';
import '../styles/envios.css';
import '../styles/mensajeria.css';
import '../styles/resenas.css';

const CATEGORIES = [
  { label: 'Todos', emoji: '🌿', value: '' },
  { label: 'Frutas', emoji: '🍌', value: 'Frutas' },
  { label: 'Verduras', emoji: '🥦', value: 'Verduras' },
  { label: 'Tubérculos', emoji: '🥔', value: 'Tubérculos' },
  { label: 'Granos', emoji: '🫘', value: 'Granos' },
  { label: 'Otros', emoji: '⚙️', value: 'Otros' },
];

const REVIEW_PRODUCTOS = [
  'Banano Urabá', 'Piña Manzana', 'Mango Tommy', 'Maracuyá',
  'Guanábana', 'Naranja Valencia', 'Coco Fresco', 'Limón Tahití'
];

export default function DashboardComprador() {
  const { t, i18n } = useTranslation();
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

  // Pedidos & Catalog state
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modalFactura, setModalFactura] = useState(false);
  const [facturaData, setFacturaData] = useState(null);

  // Catalog state
  const { cart, addToCart, removeFromCart, updateQty, total, count, clearCart } = useCart();
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [filtroTipoCatalog, setFiltroTipoCatalog] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [soloPromo, setSoloPromo] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // Debounced search logic for catalog
  useEffect(() => {
    const handler = setTimeout(() => {
      setCatalogSearch(catalogSearchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [catalogSearchQuery]);

  // Shipments state
  const [shipments, setShipments] = useState([]);
  const [historialEnvios, setHistorialEnvios] = useState([]);

  // Chat/Mensajeria state
  const [contactos, setContactos] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const chatRef = useRef(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rProducto, setRProducto] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [reviewErrors, setReviewErrors] = useState({});

  // Profile forms state
  const [perfilForm, setPerfilForm] = useState({ nombre: '', telefono: '' });
  const [pwForm, setPwForm] = useState({ contrasenaActual: '', nuevaContrasena: '' });
  const [perfilMsg, setPerfilMsg] = useState({ type: '', text: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Invoices and Payment states
  const [facturas, setFacturas] = useState([]);
  const [checkoutPedido, setCheckoutPedido] = useState(null);
  const [metodoPago, setMetodoPago] = useState('PSE');
  const [pagoModalOpen, setPagoModalOpen] = useState(false);

  // RFQ (Licitaciones) states
  const [rfqs, setRfqs] = useState([]);
  const [rfqForm, setRfqForm] = useState({ tipoFruta: 'BANANO', cantidadRequerida: '', descripcion: '', fechaLimite: '' });
  const [rfqMsg, setRfqMsg] = useState({ type: '', text: '' });

  const loadFacturas = async () => {
    try {
      const data = await api.get('/facturas/mis-facturas');
      setFacturas(extractArray(data));
    } catch (err) {
      console.error('Error loadFacturas:', err);
      setFacturas([]);
    }
  };

  const descargarPdf = (facturaId) => {
    const token = localStorage.getItem('token');
    const url = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8080'
      : 'https://agromarket-vj8x.onrender.com') + `/api/facturas/${facturaId}/pdf`;
    
    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.blob())
    .then(blob => {
      const fileUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = `factura-${facturaId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch(err => alert('Error al descargar el PDF: ' + err.message));
  };

  const currentDate = new Date().toLocaleDateString(i18n.language || 'es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Initialization
  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    try {
      const data = await api.get('/pedidos/mis-pedidos');
      setPedidos(extractArray(data));
    } catch (err) {
      console.error('Error loadPedidos:', err);
      setPedidos([]);
    }
  };

  const loadRfqs = async () => {
    try {
      const data = await api.get('/rfq/mis-solicitudes');
      setRfqs(extractArray(data));
    } catch (err) {
      console.error('Error loadRfqs:', err);
      setRfqs([]);
    }
  };

  const crearRfq = async (e) => {
    e.preventDefault();
    setRfqMsg({ type: '', text: '' });
    if (!rfqForm.cantidadRequerida || !rfqForm.fechaLimite) {
      setRfqMsg({ type: 'error', text: 'Por favor complete todos los campos obligatorios.' });
      return;
    }
    try {
      await api.post('/rfq', {
        tipoFruta: rfqForm.tipoFruta,
        cantidadRequerida: parseFloat(rfqForm.cantidadRequerida),
        descripcion: rfqForm.descripcion,
        fechaLimite: new Date(rfqForm.fechaLimite).toISOString()
      });
      setRfqMsg({ type: 'success', text: 'Licitación publicada exitosamente.' });
      setRfqForm({ tipoFruta: 'BANANO', cantidadRequerida: '', descripcion: '', fechaLimite: '' });
      loadRfqs();
    } catch (err) {
      setRfqMsg({ type: 'error', text: err.message || 'Error al publicar la licitación.' });
    }
  };

  const aceptarOfertaRfq = async (ofertaId) => {
    if (!window.confirm('¿Está seguro de que desea aceptar esta oferta? Se generará un pedido automático con los datos propuestos.')) return;
    try {
      await api.put(`/rfq/ofertas/${ofertaId}/aceptar`);
      alert('Oferta aceptada correctamente. Se ha generado un pedido en estado pendiente.');
      loadRfqs();
      loadPedidos();
    } catch (err) {
      alert('Error al aceptar la oferta: ' + err.message);
    }
  };

  // Section Loading Triggers
  useEffect(() => {
    if (activeSection === 'catalogo') {
      loadCatalogProducts();
    } else if (activeSection === 'seguimiento') {
      loadEnvios();
    } else if (activeSection === 'mensajeria') {
      loadContactos();
    } else if (activeSection === 'resenas' || activeSection === 'resumen') {
      loadReviews();
    } else if (activeSection === 'misFacturas') {
      loadFacturas();
    } else if (activeSection === 'rfq') {
      loadRfqs();
    } else if (activeSection === 'perfil' && user) {
      setPerfilForm({ nombre: user.nombre || '', telefono: user.telefono || '' });
      setPerfilMsg({ type: '', text: '' });
      setPwMsg({ type: '', text: '' });
    }
  }, [activeSection, user]);

  // Catalog loading
  const loadCatalogProducts = async () => {
    setCatalogLoading(true);
    try {
      const data = await api.get('/productos');
      setCatalogProducts(extractArray(data));
    } catch (err) {
      console.error('Error loadCatalogProducts:', err);
      setCatalogProducts([]);
    } finally {
      setCatalogLoading(false);
    }
  };

  // Shipments loading
  const loadEnvios = async () => {
    try {
      const data = await api.get('/envios/mis-envios');
      const list = extractArray(data);
      setShipments(list.filter(e => e.estado !== 'Entregado'));
      setHistorialEnvios(list);
    } catch (err) {
      console.error('Error loadEnvios:', err);
      setShipments([]);
      setHistorialEnvios([]);
    }
  };

  // Messaging loading & select
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

  // Reviews actions
  const loadReviews = async () => {
    try {
      const data = await api.get('/resenas');
      setReviews(extractArray(data));
    } catch (err) {
      console.error('Error loadReviews:', err);
      setReviews([]);
    }
  };

  const publicarResena = async () => {
    const errs = {};
    if (!rProducto) errs.producto = 'Selecciona un producto.';
    if (!rating) errs.rating = 'Selecciona una calificación.';
    if (!comentario.trim()) errs.comentario = 'Escribe un comentario.';
    setReviewErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      // Find corresponding product if possible
      const cleanProdName = rProducto.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]\s*/g, ''); // strip emoji
      const matchProduct = catalogProducts.find(p => p.nombre.toLowerCase().includes(cleanProdName.toLowerCase()));
      const requestPayload = {
        productoId: matchProduct ? matchProduct.id : 1, // fallback to ID 1 if not found
        calificacion: rating,
        comentario: comentario
      };

      const nueva = await api.post('/resenas', requestPayload);
      setReviews((prev) => [nueva, ...prev]);
      setReviewModalOpen(false);
      setRProducto('');
      setRating(0);
      setComentario('');
    } catch (err) {
      alert(t('resenas.errorPublish', 'Error al publicar reseña: ') + (err.message || 'Inténtalo de nuevo.'));
    }
  };

  // Profile Update actions
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

  // Catalog checkout handler
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const res = await api.post('/pedidos', {
        items: cart.map((i) => ({ productoId: i.id, cantidad: i.qty })),
      });
      const pedidoObj = res.data || res;
      setCheckoutPedido(pedidoObj);
      clearCart();
      setCartOpen(false);
      setPagoModalOpen(true);
    } catch (err) {
      alert('Error al crear el pedido: ' + (err.message || 'Inténtalo de nuevo.'));
    }
  };

  // Filters & helpers
  const showSection = (s) => setActiveSection(s);

  const pedidosFiltrados = filtroEstado
    ? pedidos.filter((p) => p.estado?.toLowerCase() === filtroEstado.toLowerCase())
    : pedidos;

  const catalogFiltered = catalogProducts.filter((p) => {
    const matchSearch =
      !catalogSearch ||
      p.nombre?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.tipoFruta?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchTipo = !filtroTipoCatalog || (
      filtroTipoCatalog === 'Frutas' && ['BANANO', 'MANGO', 'PINA', 'MARACUYA', 'GUANABANA', 'NARANJA', 'COCO', 'LIMON'].includes(p.tipoFruta)
    ) || (
      filtroTipoCatalog === 'Otros' && p.tipoFruta === 'OTRO'
    ) || (
      filtroTipoCatalog === 'Verduras' && false
    ) || (
      filtroTipoCatalog === 'Tubérculos' && false
    ) || (
      filtroTipoCatalog === 'Granos' && false
    );
    const matchMin = !minPrice || Number(p.precio) >= Number(minPrice);
    const matchMax = !maxPrice || Number(p.precio) <= Number(maxPrice);
    const matchPromo = !soloPromo || p.enPromocion === true;
    return matchSearch && matchTipo && matchMin && matchMax && matchPromo;
  });

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

  const progressColor = (estado) => {
    if (estado === 'Entregado') return 'var(--primary)';
    if (estado === 'En tránsito') return 'var(--blue)';
    return 'var(--gold)';
  };

  // Metrics calculation
  const totalInvestment = pedidos.reduce((sum, p) => sum + Number(p.total || 0), 0);
  const reviewsDejadasCount = reviews.filter(r => r.compradorNombre === user?.nombre).length;
  const uniqueProducersCount = new Set(pedidos.map(p => p.productor || p.nombreProductor).filter(Boolean)).size;

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-user" style={{ cursor: 'pointer' }} onClick={() => navigate('/perfil')}>
          <div className="avatar avatar-blue" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>{iniciales}</div>
          <div className="sidebar-user-info">
            <span className="name">{user?.nombre || 'María Torres'}</span>
            <span className="role">{t('dashboardComprador.premiumClient', 'Cliente Premium')}</span>
          </div>
        </div>

        <div className="sidebar-label">{t('dashboardComprador.nav.title', 'Navegación')}</div>
        <a href="#" className={`sidebar-link${activeSection === 'resumen' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); showSection('resumen'); }}>
          <span className="icon"></span> {t('dashboardComprador.nav.summary', 'Resumen')}
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'catalogo' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); showSection('catalogo'); }}>
          <span className="icon"></span> {t('dashboardComprador.nav.explore', 'Explorar Catálogo')}
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'misPedidos' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); showSection('misPedidos'); }}>
          <span className="icon"></span> {t('dashboardComprador.nav.myOrders', 'Mis Pedidos')} <span className="badge-count">{pedidos.length}</span>
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'misFacturas' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); showSection('misFacturas'); }}>
          <span className="icon"></span> {t('dashboardComprador.nav.myInvoices', 'Mis Facturas')} <span className="badge-count">{facturas.length}</span>
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'rfq' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); showSection('rfq'); }}>
          <span className="icon"></span> Licitaciones B2B (RFQ)
        </a>

        <div className="sidebar-divider"></div>
        <div className="sidebar-label">{t('dashboardComprador.services.title', 'Servicios')}</div>
        <a href="#" className={`sidebar-link${activeSection === 'seguimiento' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); showSection('seguimiento'); }}>
          <span className="icon"></span> {t('dashboardComprador.services.tracking', 'Seguimiento')}
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'mensajeria' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); showSection('mensajeria'); }}>
          <span className="icon"></span> {t('dashboardComprador.services.messaging', 'Mensajería')}
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'resenas' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); showSection('resenas'); }}>
          <span className="icon"></span> {t('dashboardComprador.services.reviews', 'Mis Reseñas')}
        </a>
        <Link to="/perfil" className="sidebar-link">
          <span className="icon"></span> {t('profile.title', 'Mi Perfil')}
        </Link>

        <a href="#" className="sidebar-link" style={{ marginTop: 'auto', color: 'var(--red)' }} onClick={async (e) => { e.preventDefault(); await logout(); navigate('/login'); }}>
          <span className="icon"></span> {t('dashboardComprador.services.logout', 'Cerrar sesión')}
        </a>
      </aside>

      {/* MOBILE NAV */}
      <nav className="mobile-nav">
        <a href="#" className={`mobile-nav-item${activeSection === 'resumen' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); showSection('resumen'); }}>
          <span className="icon"></span><span>{t('dashboardComprador.mobileNav.home', 'Inicio')}</span>
        </a>
        <a href="#" className={`mobile-nav-item${activeSection === 'catalogo' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); showSection('catalogo'); }}>
          <span className="icon"></span><span>{t('dashboardComprador.mobileNav.shop', 'Tienda')}</span>
        </a>
        <a href="#" className={`mobile-nav-item${activeSection === 'misPedidos' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); showSection('misPedidos'); }}>
          <span className="icon"></span><span>{t('dashboardComprador.mobileNav.orders', 'Pedidos')}</span>
        </a>
        <a href="#" className={`mobile-nav-item${activeSection === 'mensajeria' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); showSection('mensajeria'); }}>
          <span className="icon"></span><span>{t('dashboardComprador.mobileNav.chat', 'Chat')}</span>
        </a>
        <Link to="/perfil" className="mobile-nav-item">
          <span className="icon"></span><span>{t('dashboardComprador.mobileNav.profile', 'Perfil')}</span>
        </Link>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <LanguageSwitcher />
        </div>

        {/* ─── RESUMEN ─── */}
        {activeSection === 'resumen' && (
          <div className="section active" id="sec-resumen">
            <div className="dash-header">
              <div className="dash-welcome">
                <h1>{t('dashboardComprador.welcome', '¡Hola de nuevo, {{name}}!', { name: nombreUsuario })}</h1>
                <p>{currentDate} • 28°C {t('dashboardComprador.sub', 'Urabá')}</p>
              </div>
              <button className="btn-cta" onClick={() => setActiveSection('catalogo')}>{t('dashboardComprador.exploreCatalog', 'Explorar catálogo →')}</button>
            </div>

            {(!user?.telefono) && (
              <div style={{
                background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                border: '1px solid #7dd3fc',
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
                    <strong style={{ color: '#0369a1', display: 'block' }}>¡Mejora la seguridad de tu cuenta!</strong>
                    <span style={{ color: '#0369a1', fontSize: '0.85rem' }}>Agrega tu número de teléfono y verifica tu perfil para facilitar el contacto con los productores.</span>
                  </div>
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate('/perfil')}
                  style={{ background: '#0369a1', color: '#fff', border: 'none', padding: '8px 16px' }}
                >
                  Configurar Perfil
                </button>
              </div>
            )}

            <div className="stats-grid">
              <div className="stat-card color-1">
                <span className="stat-icon-lg"></span>
                <div className="stat-label">{t('dashboardComprador.stats.ordersPlaced', 'Pedidos Realizados')}</div>
                <div className="stat-value">{String(pedidos.length).padStart(2, '0')}</div>
              </div>
              <div className="stat-card color-2">
                <span className="stat-icon-lg"></span>
                <div className="stat-label">{t('dashboardComprador.stats.totalInvestment', 'Inversión Total')}</div>
                <div className="stat-value">${totalInvestment.toLocaleString('es-CO')}</div>
              </div>
              <div className="stat-card color-3">
                <span className="stat-icon-lg"></span>
                <div className="stat-label">{t('dashboardComprador.stats.reviewsLeft', 'Reseñas Dejadas')}</div>
                <div className="stat-value">{reviewsDejadasCount}</div>
              </div>
              <div className="stat-card color-4">
                <span className="stat-icon-lg"></span>
                <div className="stat-label">{t('dashboardComprador.stats.producers', 'Productores')}</div>
                <div className="stat-value">{uniqueProducersCount}</div>
              </div>
            </div>

            {/* TABLA RECIENTES */}
            <div className="card-table" style={{ marginBottom: '32px' }}>
              <div className="table-header">
                <h3 className="card-title"> {t('dashboardComprador.recentOrders', 'Pedidos Recientes')}</h3>
                <a href="#" onClick={(e) => { e.preventDefault(); showSection('misPedidos'); }} style={{ fontSize: '0.8rem', fontWeight: '600' }}>{t('dashboardComprador.viewAllOrders', 'Ver todos los pedidos')}</a>
              </div>
              <div className="table-wrap">
                <table className="table-responsive">
                  <thead>
                    <tr>
                      <th>{t('pedidos.id', 'ID')}</th>
                      <th>{t('pedidos.product', 'Producto')}</th>
                      <th>{t('pedidos.total', 'Total')}</th>
                      <th>{t('pedidos.statusHeader', 'Estado')}</th>
                      <th>{t('pedidos.actions', 'Acciones')}</th>
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
                          {p.estado?.toLowerCase() === 'pendiente' && (
                            <button onClick={() => { setCheckoutPedido(p); setPagoModalOpen(true); }} className="btn btn-primary btn-sm" style={{ marginRight: '6px' }}>Pagar</button>
                          )}
                          <button onClick={() => setActiveSection('seguimiento')} className="btn btn-secondary btn-sm">{t('pedidos.track', 'Rastrear')}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── EXPLORAR CATALOGO ─── */}
        {activeSection === 'catalogo' && (
          <div className="section active">
            <div className="catalog-hero" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1f4d2a 100%)', borderRadius: '16px', padding: '32px', color: '#fff', marginBottom: '24px' }}>
              <h1 style={{ color: '#fff', fontSize: '2rem', marginBottom: '8px' }}>{t('catalog.heroTitle', 'Frutas tropicales')}</h1>
              <p style={{ opacity: 0.9 }}>{t('catalog.heroSub', 'Productos frescos de los agricultores de ASAFRUT. Sin intermediarios, precios justos.')}</p>
            </div>

            <div className="catalog-controls" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div className="search-wrapper" style={{ flex: 1, position: 'relative' }}>
                <input
                  className="search-input"
                  style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                  type="text"
                  placeholder={t('catalog.searchPlaceholder', 'Buscar productos...')}
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                />
                <span style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }}></span>
              </div>
              {count > 0 && (
                <button className="btn btn-primary" onClick={() => setCartOpen(true)}>
                  {t('catalog.cartButton', 'Carrito')} ({count})
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'flex-start' }} className="catalog-layout-grid">
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="catalog-controls" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  <div className="search-wrapper" style={{ flex: 1, position: 'relative' }}>
                    <input
                      className="search-input"
                      style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                      type="text"
                      placeholder={t('catalog.searchPlaceholder', 'Buscar productos...')}
                      value={catalogSearchQuery}
                      onChange={(e) => setCatalogSearchQuery(e.target.value)}
                    />
                    <span style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }}></span>
                  </div>
                  {count > 0 && (
                    <button className="btn btn-primary" onClick={() => setCartOpen(true)}>
                       {t('catalog.cartButton', 'Carrito')} ({count})
                    </button>
                  )}
                </div>

                {/* CATEGORY CHIPS */}
                <div className="category-chips" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      className={`chip${filtroTipoCatalog === cat.value ? ' active' : ''}`}
                      onClick={() => setFiltroTipoCatalog(cat.value)}
                    >
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SIDE FILTER CONTROLS */}
              <div className="card-table" style={{ padding: '20px', borderRadius: 'var(--radius)', background: '#fff' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                   Filtros
                </h4>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Precio Mínimo (COP)</label>
                  <input className="form-input" type="number" placeholder="$ Mín" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Precio Máximo (COP)</label>
                  <input className="form-input" type="number" placeholder="$ Máx" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                  <input type="checkbox" id="promoToggleCatalog" checked={soloPromo} onChange={(e) => setSoloPromo(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                  <label htmlFor="promoToggleCatalog" style={{ fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer' }}> Sólo Promociones</label>
                </div>
                {(minPrice || maxPrice || soloPromo || filtroTipoCatalog) && (
                  <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '16px' }} onClick={() => { setMinPrice(''); setMaxPrice(''); setSoloPromo(false); setFiltroTipoCatalog(''); setCatalogSearchQuery(''); }}>
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* PRODUCT GRID */}
            <div className="catalog-grid">
              {catalogLoading ? (
                <div style={{ padding: '48px', textAlign: 'center', gridColumn: '1 / -1' }}>{t('catalog.loading', 'Cargando catálogo...')}</div>
              ) : catalogFiltered.length === 0 ? (
                <div className="catalog-empty" style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem' }}></div>
                  <h3>{t('catalog.noProducts', 'No se encontraron productos')}</h3>
                </div>
              ) : (
                catalogFiltered.map((p) => (
                  <div key={p.id} className="catalog-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                    {p.enPromocion && (
                      <span className="badge-promo" style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--red)', color: '#fff', fontSize: '0.65rem', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', zIndex: 5 }}>
                        % PROMO
                      </span>
                    )}
                    <div className="catalog-card-img-wrap" style={{ position: 'relative', height: '180px' }}>
                      <img
                        src={p.imagenUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}
                        alt={p.nombre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span className={`catalog-card-badge${p.stock <= 0 ? ' out' : ''}`} style={{ position: 'absolute', top: '10px', left: '10px', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: p.stock > 0 ? 'var(--green-bg)' : 'var(--red-bg)', color: p.stock > 0 ? 'var(--primary)' : 'var(--red)' }}>
                        {p.stock > 0 ? 'Disponible' : 'Agotado'}
                      </span>
                    </div>
                    <div className="catalog-card-body" style={{ padding: '16px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{p.tipo}</div>
                      <h4 style={{ margin: '4px 0 8px 0', fontSize: '1.05rem', fontWeight: '700' }}>{p.nombre}</h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                         {p.productorNombre || p.productor || p.nombreProductor || 'Productor ASAFRUT'}
                        {p.productorVerificado && (
                          <span style={{ background: '#e2f0d9', color: '#385723', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700', border: '1px solid #385723' }}>
                             Gold Supplier
                          </span>
                        )}
                      </div>
                      
                      {p.cantidadMinimaMayorista && p.precioMayorista && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', margin: '8px 0', border: '1px dashed var(--border-light)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Por menor:</span>
                            <span>${Number(p.precio).toLocaleString('es-CO')}/kg</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: 'var(--primary)' }}>
                            <span>Por mayor (≥{p.cantidadMinimaMayorista}kg):</span>
                            <span>${Number(p.precioMayorista).toLocaleString('es-CO')}/kg</span>
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                        <span style={{ fontWeight: '800', color: p.enPromocion ? 'var(--red)' : 'var(--primary)', fontSize: '1.15rem' }}>
                          {p.enPromocion && p.precioPromocion ? (
                            <>
                              <span style={{ textDecoration: 'line-through', color: 'var(--text-dim)', fontSize: '0.8rem', marginRight: '6px' }}>
                                ${Number(p.precio).toLocaleString('es-CO')}
                              </span>
                              ${Number(p.precioPromocion).toLocaleString('es-CO')}
                            </>
                          ) : (
                            `$${Number(p.precio).toLocaleString('es-CO')}`
                          )}
                          <small style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/kg</small>
                        </span>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => addToCart(p)}
                          disabled={p.stock <= 0}
                        >
                          {t('catalog.addToCart', '+ Agregar')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── MIS PEDIDOS ─── */}
        {activeSection === 'misPedidos' && (
          <div className="section active" id="sec-misPedidos">
            <div className="dash-header">
              <div className="dash-welcome">
                <h1>{t('dashboardComprador.nav.myOrders', 'Historial de Pedidos')}</h1>
                <p>{t('dashboardComprador.ordersSub', 'Gestiona y revisa tus compras anteriores')}</p>
              </div>
            </div>
            <div className="card-table">
              <div className="table-filters" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <select className="form-select" style={{ width: '180px' }} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
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
                      <th>{t('pedidos.id', 'ID')}</th>
                      <th>{t('pedidos.product', 'Producto')}</th>
                      <th>{t('pedidos.quantity', 'Cantidad')}</th>
                      <th>{t('pedidos.total', 'Total')}</th>
                      <th>{t('pedidos.statusHeader', 'Estado')}</th>
                      <th>{t('pedidos.actions', 'Acciones')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosFiltrados.map((p) => (
                      <tr key={p.id}>
                        <td data-label={t('pedidos.id', 'ID')}>#{p.id}</td>
                        <td data-label={t('pedidos.product', 'Producto')}>{p.producto || p.nombreProducto || '—'}</td>
                        <td data-label={t('pedidos.quantity', 'Cantidad')}>{p.cantidad || '—'} kg</td>
                        <td data-label={t('pedidos.total', 'Total')}>${Number(p.total).toLocaleString('es-CO')}</td>
                        <td data-label={t('pedidos.statusHeader', 'Estado')}><span className={badgeClass(p.estado)}>{t('pedidos.status.' + p.estado?.toLowerCase(), p.estado)}</span></td>
                        <td data-label={t('pedidos.actions', 'Acciones')}>
                          {p.estado?.toLowerCase() === 'pendiente' && (
                            <button onClick={() => { setCheckoutPedido(p); setPagoModalOpen(true); }} className="btn btn-primary btn-sm" style={{ marginRight: '6px' }}>Pagar</button>
                          )}
                          <button className="btn btn-secondary btn-sm" onClick={() => openFactura(p)}>{t('pedidos.invoice', 'Factura')}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── SEGUIMIENTO DE ENVIOS ─── */}
        {activeSection === 'seguimiento' && (
          <div className="section active">
            <div className="dash-header">
              <div className="dash-welcome">
                <h1> {t('envios.title', 'Seguimiento de Envíos')}</h1>
                <p>Monitorea tus pedidos en ruta en tiempo real</p>
              </div>
            </div>

            <div id="shipmentsContainer" style={{ marginTop: '20px' }}>
              {shipments.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px', textAlign: 'center', background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '2rem' }}></div>
                  <div style={{ marginTop: '8px' }}>{t('envios.noActive', 'No hay envíos activos en este momento.')}</div>
                </div>
              ) : (
                shipments.map((s) => (
                  <div key={s.id} className="shipment-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>{s.producto || 'Producto ASAFRUT'}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                           {s.origen || 'Chigorodó'} → {s.direccionDestino || 'Destino'} · {s.transportista || 'Pendiente'}
                        </div>
                      </div>
                      <span className="badge-status status-shipped">{t('pedidos.status.' + s.estado?.toLowerCase(), s.estado)}</span>
                    </div>
                    <div style={{ background: 'var(--border-light)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s.progreso || (s.estado === 'En tránsito' ? 50 : s.estado === 'Entregado' ? 100 : 10)}%`, background: progressColor(s.estado), borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Guía: {s.guia || 'No asignada'}</div>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}> {t('envios.historyTitle', 'Historial de todos los envíos')}</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t('envios.id', 'ID Envío')}</th>
                      <th>{t('envios.route', 'Origen → Destino')}</th>
                      <th>{t('envios.carrier', 'Transportista')}</th>
                      <th>{t('envios.status', 'Estado')}</th>
                      <th>Guía</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialEnvios.map((e) => (
                      <tr key={e.id}>
                        <td data-label="ID Envío">#{e.id}</td>
                        <td data-label="Ruta">{e.origen || 'Chigorodó'} → {e.direccionDestino}</td>
                        <td data-label="Transportista">{e.transportista || '—'}</td>
                        <td data-label="Estado"><span className={`badge-status ${e.estado === 'Entregado' ? 'status-delivered' : 'status-pending'}`}>{t('pedidos.status.' + e.estado?.toLowerCase(), e.estado)}</span></td>
                        <td data-label="Guía">{e.guia || '—'}</td>
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

        {/* ─── RESEÑAS ─── */}
        {activeSection === 'resenas' && (
          <div className="section active">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span className="section-title" style={{ fontSize: '1.25rem', fontWeight: '700' }}> Mis Reseñas de Productos</span>
              <button className="btn btn-primary" onClick={() => setReviewModalOpen(true)}>+ Nueva reseña</button>
            </div>

            <div id="reviewsList">
              {reviews.length === 0 ? (
                <div className="empty-state" style={{ padding: '60px', textAlign: 'center', background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '2rem' }}></div>
                  <div>No hay reseñas registradas aún.</div>
                </div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="review-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px 24px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontWeight: '700' }}>{r.compradorNombre || 'Usuario'}</div>
                      <div style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>{'★'.repeat(r.calificacion || 5)}</div>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>{r.comentario}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>{new Date(r.fecha).toLocaleDateString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── MI PERFIL & AJUSTES ─── */}
        {activeSection === 'perfil' && (
          <div className="section active">
            <div className="dash-header">
              <div className="dash-welcome">
                <h1> Ajustes de Mi Perfil</h1>
                <p>Administra tu información personal y la seguridad de tu cuenta</p>
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
                    <label className="form-label">Nombre Completo</label>
                    <input className="form-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }} value={perfilForm.nombre} onChange={(e) => setPerfilForm({ ...perfilForm, nombre: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Teléfono Móvil</label>
                    <input className="form-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }} value={perfilForm.telefono} onChange={(e) => setPerfilForm({ ...perfilForm, telefono: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label">Correo Electrónico (No editable)</label>
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
        {/* ─── MIS FACTURAS ─── */}
        {activeSection === 'misFacturas' && (
          <div className="section active">
            <div className="dash-header">
              <div className="dash-welcome">
                <h1>📄 Mis Facturas de Compra</h1>
                <p>Descarga tus comprobantes electrónicos detallados de ASAFRUT</p>
              </div>
            </div>
            <div className="card-table">
              <div className="table-wrap">
                <table className="table-responsive">
                  <thead>
                    <tr>
                      <th>Factura N°</th>
                      <th>Pedido ID</th>
                      <th>Subtotal</th>
                      <th>IVA (19%)</th>
                      <th>Total</th>
                      <th>Fecha Emisión</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturas.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No tienes facturas emitidas en este momento.</td>
                      </tr>
                    ) : (
                      facturas.map((f) => (
                        <tr key={f.id}>
                          <td data-label="Factura N°">{f.numeroFactura}</td>
                          <td data-label="Pedido ID">#{f.pedidoId}</td>
                          <td data-label="Subtotal">${Number(f.subtotal).toLocaleString('es-CO')}</td>
                          <td data-label="IVA">${Number(f.impuesto).toLocaleString('es-CO')}</td>
                          <td data-label="Total" style={{ fontWeight: '600', color: 'var(--primary)' }}>${Number(f.total).toLocaleString('es-CO')}</td>
                          <td data-label="Fecha">{new Date(f.fechaEmision).toLocaleDateString()}</td>
                          <td data-label="Acciones">
                            <button className="btn btn-secondary btn-sm" onClick={() => descargarPdf(f.id)}>Descargar PDF</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── LICITACIONES B2B (RFQ) ─── */}
        {activeSection === 'rfq' && (
          <div className="section active">
            <div className="dash-header">
              <div className="dash-welcome">
                <h1> Licitaciones B2B (RFQ)</h1>
                <p>Publica solicitudes de cotización al por mayor para recibir ofertas competitivas de productores verificados</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginTop: '24px' }}>
              {/* Publicar Solicitud */}
              <div className="card-table" style={{ padding: '24px', borderRadius: '12px', background: 'var(--card-bg)' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>Nueva Solicitud (RFQ)</h3>
                {rfqMsg.text && (
                  <div style={{ padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem', background: rfqMsg.type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)', color: rfqMsg.type === 'success' ? 'var(--primary)' : 'var(--red)' }}>
                    {rfqMsg.text}
                  </div>
                )}
                <form onSubmit={crearRfq}>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Tipo de Fruta *</label>
                    <select className="form-select" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }} value={rfqForm.tipoFruta} onChange={(e) => setRfqForm({ ...rfqForm, tipoFruta: e.target.value })}>
                      <option value="BANANO"> Banano</option>
                      <option value="PINA"> Piña</option>
                      <option value="MANGO"> Mango</option>
                      <option value="MARACUYA"> Maracuyá</option>
                      <option value="GUANABANA"> Guanábana</option>
                      <option value="NARANJA"> Naranja</option>
                      <option value="COCO"> Coco</option>
                      <option value="LIMON"> Limón</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Cantidad Requerida (kg) *</label>
                    <input type="number" min="1" className="form-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }} value={rfqForm.cantidadRequerida} onChange={(e) => setRfqForm({ ...rfqForm, cantidadRequerida: e.target.value })} placeholder="Ej: 500" />
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Fecha Límite para Ofertar *</label>
                    <input type="datetime-local" className="form-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }} value={rfqForm.fechaLimite} onChange={(e) => setRfqForm({ ...rfqForm, fechaLimite: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label">Instrucciones / Especificaciones</label>
                    <textarea rows="3" className="form-textarea" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }} value={rfqForm.descripcion} onChange={(e) => setRfqForm({ ...rfqForm, descripcion: e.target.value })} placeholder="Ej: Busco piña manzana de calibre grande, despacho a bodega en Medellín."></textarea>
                  </div>
                  <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Publicar Licitación</button>
                </form>
              </div>

              {/* Mis Solicitudes y sus Ofertas */}
              <div className="card-table" style={{ padding: '24px', borderRadius: '12px', background: 'var(--card-bg)' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>Mis Licitaciones Publicadas</h3>
                {rfqs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>No has publicado ninguna licitación.</div>
                ) : (
                  rfqs.map((rfq) => (
                    <div key={rfq.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '16px', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--primary)' }}>
                          {rfq.tipoFruta} - {rfq.cantidadRequerida} kg
                        </span>
                        <span className={`badge-status ${rfq.activo ? 'status-shipped' : 'status-pending'}`} style={{ fontSize: '0.75rem' }}>
                          {rfq.activo ? 'Activa' : 'Cerrada'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', margin: '4px 0' }}>{rfq.descripcion || 'Sin descripción.'}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Vence: {new Date(rfq.fechaLimite).toLocaleString()}
                      </p>

                      <div style={{ marginTop: '14px', borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
                        <strong style={{ fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Cotizaciones Recibidas ({rfq.ofertas?.length || 0}):</strong>
                        {(!rfq.ofertas || rfq.ofertas.length === 0) ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Esperando ofertas de productores...</span>
                        ) : (
                          rfq.ofertas.map((of) => (
                            <div key={of.id} style={{ background: '#fff', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.8rem', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <strong>{of.productorNombre}</strong>: <span style={{ color: 'var(--primary)', fontWeight: '600' }}>${Number(of.precioPropuesto).toLocaleString('es-CO')}/kg</span>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>"{of.comentarios}"</div>
                              </div>
                              {rfq.activo && (
                                <button className="btn btn-primary btn-sm" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => aceptarOfertaRfq(of.id)}>
                                  Aceptar
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL PROCESAR PAGO (PSE/TARJETA/EFECTIVO) */}
      {pagoModalOpen && checkoutPedido && (
        <div className="modal-overlay open" id="modalPago">
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <span className="modal-title"> Completar Pago en Línea</span>
              <button className="modal-close" onClick={() => { setPagoModalOpen(false); loadPedidos(); setActiveSection('misPedidos'); }}>✕</button>
            </div>
            <div style={{ padding: '24px' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '1rem', fontWeight: '700' }}>Resumen del Pedido</h4>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
                <p><strong>Pedido #:</strong> {checkoutPedido.id}</p>
                <p><strong>Total a pagar:</strong> ${(checkoutPedido.total || 0).toLocaleString('es-CO')}</p>
                <p><strong>Estado:</strong> Pendiente de Pago</p>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Método de Pago</label>
                <select 
                  className="form-select" 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                >
                  <option value="PSE">PSE (Débito Cuenta de Ahorros/Corriente)</option>
                  <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                  <option value="EFECTIVO">Efectivo (Corresponsal Bancario)</option>
                </select>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', fontWeight: '600' }}
                onClick={async () => {
                  try {
                    const res = await api.post('/pagos/iniciar', {
                      pedidoId: checkoutPedido.id,
                      metodoPago: metodoPago
                    });
                    const data = res.data || res;
                    setPagoModalOpen(false);
                    navigate(data.urlPasarela);
                  } catch (err) {
                    alert('Error al iniciar el pago: ' + err.message);
                  }
                }}
              >
                Proceder a Pagar →
              </button>
            </div>
          </div>
        </div>
      )}

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
              <button className="btn btn-primary" onClick={() => alert(t('pedidos.invoiceSent', 'Factura enviada al correo registrado.'))}>{t('pedidos.sendPdf', ' Enviar PDF')}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVA RESEÑA */}
      {reviewModalOpen && (
        <div className="modal-overlay open">
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <span className="modal-title">Nueva Reseña de Producto</span>
              <button className="modal-close" onClick={() => setReviewModalOpen(false)}>✕</button>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Producto *</label>
              <select className="form-select" value={rProducto} onChange={(e) => setRProducto(e.target.value)}>
                <option value="">Selecciona un producto...</option>
                {REVIEW_PRODUCTOS.map((p) => <option key={p}>{p}</option>)}
              </select>
              {reviewErrors.producto && <span className="form-error" style={{ color: 'var(--red)', fontSize: '0.75rem' }}>{reviewErrors.producto}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Calificación *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((v) => (
                  <span
                    key={v}
                    onClick={() => setRating(v)}
                    onMouseOver={() => setHoverRating(v)}
                    onMouseOut={() => setHoverRating(0)}
                    style={{ cursor: 'pointer', fontSize: '1.8rem', color: v <= (hoverRating || rating) ? 'var(--gold)' : 'var(--border-light)' }}
                  >★</span>
                ))}
              </div>
              {reviewErrors.rating && <span className="form-error" style={{ color: 'var(--red)', fontSize: '0.75rem' }}>{reviewErrors.rating}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Comentario *</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Describe tu experiencia con el producto..."
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '6px' }}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              ></textarea>
              {reviewErrors.comentario && <span className="form-error" style={{ color: 'var(--red)', fontSize: '0.75rem' }}>{reviewErrors.comentario}</span>}
            </div>

            <div className="modal-footer" style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setReviewModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={publicarResena}> Publicar reseña</button>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {cartOpen && (
        <>
          <div className="cart-drawer-overlay" onClick={() => setCartOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000 }} />
          <div className="cart-drawer open" style={{ position: 'fixed', right: 0, top: 0, height: '100%', width: '380px', background: 'var(--card-bg)', zIndex: 1001, padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div className="cart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}> Mi Carrito</h3>
              <button className="cart-close" onClick={() => setCartOpen(false)}>✕</button>
            </div>
            <div className="cart-items" style={{ flex: 1, overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>Tu carrito está vacío.</div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="cart-item-row" style={{ display: 'flex', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600' }}>{item.nombre}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {item.cantidadMinimaMayorista && item.precioMayorista && item.qty >= item.cantidadMinimaMayorista ? (
                          <>
                            <span style={{ textDecoration: 'line-through', marginRight: '6px', fontSize: '0.75rem' }}>
                              ${Number(item.precio).toLocaleString('es-CO')}/kg
                            </span>
                            <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
                              ${Number(item.precioMayorista).toLocaleString('es-CO')}/kg
                            </span>
                          </>
                        ) : (
                          `$${Number(item.precio).toLocaleString('es-CO')}/kg`
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => updateQty(item.id, item.qty - 1)} style={{ padding: '2px 8px' }}>-</button>
                        <span>{item.qty} kg</span>
                        <button className="btn btn-secondary btn-sm" onClick={() => updateQty(item.id, item.qty + 1)} style={{ padding: '2px 8px' }}>+</button>
                      </div>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => removeFromCart(item.id)} style={{ color: 'var(--red)', alignSelf: 'center' }}>✕</button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="cart-footer" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', marginBottom: '16px' }}>
                  <span>Total Pedido:</span>
                  <span>${total.toLocaleString('es-CO')}</span>
                </div>
                <button className="btn btn-primary" onClick={handleCheckout} style={{ width: '100%' }}>Proceder al Pago →</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
