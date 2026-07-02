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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // States for Coupons and Config
  const [todosCupones, setTodosCupones] = useState([]);
  const [nuevoCupon, setNuevoCupon] = useState({ codigo: '', tipo: 'ENVIO_GRATIS', valor: 0, montoMinimo: 0, usuarioId: '', fechaExpiracion: '' });
  const [costoEnvioNacional, setCostoEnvioNacional] = useState(Number(localStorage.getItem('costo_envio')) || 15000);
  const [mantenimientoMode, setMantenimientoMode] = useState(localStorage.getItem('mantenimiento_mode') === 'true');

  // States for Finanzas and Logística Reports
  const [finanzasData, setFinanzasData] = useState(null);
  const [logisticaData, setLogisticaData] = useState(null);
  const [loadingFinanzas, setLoadingFinanzas] = useState(false);
  const [loadingLogistica, setLoadingLogistica] = useState(false);
  const [errorFinanzas, setErrorFinanzas] = useState('');
  const [errorLogistica, setErrorLogistica] = useState('');

  // Pagination & Search States for Users
  const [searchUsuarios, setSearchUsuarios] = useState('');
  const [searchUsuariosInput, setSearchUsuariosInput] = useState('');
  const [pageUsuarios, setPageUsuarios] = useState(0);
  const [totalPagesUsuarios, setTotalPagesUsuarios] = useState(1);
  const [totalElementsUsuarios, setTotalElementsUsuarios] = useState(0);

  // Pagination & Search States for Products
  const [searchProductos, setSearchProductos] = useState('');
  const [searchProductosInput, setSearchProductosInput] = useState('');
  const [pageProductos, setPageProductos] = useState(0);
  const [totalPagesProductos, setTotalPagesProductos] = useState(1);
  const [totalElementsProductos, setTotalElementsProductos] = useState(0);

  const [usuariosPendientes, setUsuariosPendientes] = useState([]);

  const handleAprobarUsuario = async (userId) => {
    try {
      await api.post(`/admin/aprobar-usuario/${userId}`);
      alert('Usuario aprobado con éxito.');
      loadAll();
      loadUsuarios();
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
      loadUsuarios();
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

  const loadUsuarios = async () => {
    try {
      const res = await api.get(`/admin/usuarios?page=${pageUsuarios}&size=20&search=${searchUsuarios}`);
      const data = res.data || res;
      setUsuarios(extractArray(data));
      setTotalPagesUsuarios(data.totalPages || 1);
      setTotalElementsUsuarios(data.totalElements || 0);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadProductos = async () => {
    try {
      const res = await api.get(`/admin/productos?page=${pageProductos}&size=15&search=${searchProductos}`);
      const data = res.data || res;
      setProductos(extractArray(data));
      setTotalPagesProductos(data.totalPages || 1);
      setTotalElementsProductos(data.totalElements || 0);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  // Debounced search for users
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchUsuarios(searchUsuariosInput);
      setPageUsuarios(0);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchUsuariosInput]);

  // Debounced search for products
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchProductos(searchProductosInput);
      setPageProductos(0);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchProductosInput]);

  // Load users when page/search changes
  useEffect(() => {
    if (activeSection === 'usuarios') {
      loadUsuarios();
    }
  }, [pageUsuarios, searchUsuarios, activeSection]);

  // Load products when page/search changes
  useEffect(() => {
    if (activeSection === 'productos') {
      loadProductos();
    }
  }, [pageProductos, searchProductos, activeSection]);

  useEffect(() => {
    loadAll();
    loadUsuarios();
    loadProductos();
  }, []);

  useEffect(() => {
    if (activeSection === 'escrow') {
      loadPagosFideicomiso();
    }
  }, [activeSection]);

  const loadAll = async () => {
    try {
      const [r, db, up] = await Promise.all([
        api.get('/resenas').catch(() => []),
        api.get('/admin/dashboard').catch(() => null),
        api.get('/admin/usuarios-pendientes').catch(() => []),
      ]);
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

  const loadTodosCupones = async () => {
    try {
      const res = await api.get('/cupones/todos');
      setTodosCupones(extractArray(res));
    } catch (err) {
      console.error('Error loadTodosCupones:', err);
    }
  };

  const handleCrearCupon = async (e) => {
    e.preventDefault();
    if (!nuevoCupon.codigo.trim()) return alert('El código de cupón es obligatorio.');
    try {
      const payload = {
        codigo: nuevoCupon.codigo.toUpperCase().trim(),
        tipo: nuevoCupon.tipo,
        valor: Number(nuevoCupon.valor) || 0,
        montoMinimo: Number(nuevoCupon.montoMinimo) || 0,
        usuarioId: nuevoCupon.usuarioId ? Number(nuevoCupon.usuarioId) : null,
        usado: false,
        fechaExpiracion: nuevoCupon.fechaExpiracion ? `${nuevoCupon.fechaExpiracion}T23:59:59` : null
      };
      await api.post('/cupones', payload);
      alert('Cupón creado con éxito.');
      setNuevoCupon({ codigo: '', tipo: 'ENVIO_GRATIS', valor: 0, montoMinimo: 0, usuarioId: '', fechaExpiracion: '' });
      loadTodosCupones();
    } catch (err) {
      alert('Error al crear cupón: ' + err.message);
    }
  };

  const handleEliminarCupon = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este cupón?')) return;
    try {
      await api.delete(`/cupones/${id}`);
      alert('Cupón eliminado con éxito.');
      loadTodosCupones();
    } catch (err) {
      alert('Error al eliminar cupón: ' + err.message);
    }
  };

  const loadFinanzas = async () => {
    setLoadingFinanzas(true);
    setErrorFinanzas('');
    try {
      const res = await api.get('/admin/reportes/finanzas');
      setFinanzasData(res.data || res);
    } catch (err) {
      console.error('Error loading finanzas:', err);
      setErrorFinanzas(err.message || 'Error al cargar reporte de finanzas.');
    } finally {
      setLoadingFinanzas(false);
    }
  };

  const loadLogistica = async () => {
    setLoadingLogistica(true);
    setErrorLogistica('');
    try {
      const res = await api.get('/admin/reportes/logistica');
      setLogisticaData(res.data || res);
    } catch (err) {
      console.error('Error loading logistica:', err);
      setErrorLogistica(err.message || 'Error al cargar reporte de logística.');
    } finally {
      setLoadingLogistica(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'finanzas') {
      loadFinanzas();
    } else if (activeSection === 'logistica') {
      loadLogistica();
    } else if (activeSection === 'cupones') {
      loadTodosCupones();
    }
  }, [activeSection]);

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
      {/* Overlay para sidebar móvil */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} 
        onClick={() => setSidebarOpen(false)} 
      />

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-user">
          <div className="avatar avatar-red" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>AD</div>
          <div className="sidebar-user-info">
            <span className="name">{t('admin.roleAdmin', 'Administrador')}</span>
            <span className="role">{t('admin.supportRole', 'Soporte AgroMarket')}</span>
          </div>
        </div>

        <div className="sidebar-label">{t('admin.nav.title', 'Panel de Control')}</div>
        <a href="#" className={`sidebar-link${activeSection === 'usuarios' ? ' active' : ''}`} id="link-usuarios" onClick={(e) => { e.preventDefault(); setActiveSection('usuarios'); setSidebarOpen(false); }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
          {t('admin.nav.users', 'Usuarios')}
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'productos' ? ' active' : ''}`} id="link-productos" onClick={(e) => { e.preventDefault(); setActiveSection('productos'); setSidebarOpen(false); }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm1-15l5 5h-4v6h-2v-6H7l5-5z"/></svg>
          {t('admin.nav.products', 'Productos')}
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'resenas' ? ' active' : ''}`} id="link-resenas" onClick={(e) => { e.preventDefault(); setActiveSection('resenas'); setSidebarOpen(false); }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          {t('admin.nav.moderation', 'Moderación')}
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'escrow' ? ' active' : ''}`} id="link-escrow" onClick={(e) => { e.preventDefault(); setActiveSection('escrow'); setSidebarOpen(false); }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
          Fideicomiso (Escrow)
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'cupones' ? ' active' : ''}`} id="link-cupones" onClick={(e) => { e.preventDefault(); setActiveSection('cupones'); setSidebarOpen(false); }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}><path d="M20 12c0-1.1.9-2 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2-1.1 0-2-.9-2-2z"/></svg>
          Cupones Descuento
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'configuracion' ? ' active' : ''}`} id="link-configuracion" onClick={(e) => { e.preventDefault(); setActiveSection('configuracion'); setSidebarOpen(false); }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
          Configuración
        </a>
        <Link to="/perfil" className="sidebar-link" id="link-perfil" onClick={() => setSidebarOpen(false)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          {t('profile.title', 'Mi Perfil')}
        </Link>

        <div className="sidebar-divider"></div>
        <div className="sidebar-label">{t('admin.reports.title', 'Reportes')}</div>
        <a href="#" className={`sidebar-link${activeSection === 'finanzas' ? ' active' : ''}`} id="link-finanzas" onClick={(e) => { e.preventDefault(); setActiveSection('finanzas'); setSidebarOpen(false); }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
          {t('admin.reports.finance', 'Finanzas')}
        </a>
        <a href="#" className={`sidebar-link${activeSection === 'logistica' ? ' active' : ''}`} id="link-logistica" onClick={(e) => { e.preventDefault(); setActiveSection('logistica'); setSidebarOpen(false); }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
          {t('admin.reports.logistics', 'Logística')}
        </a>

        <a href="#" className="sidebar-link" style={{ marginTop: 'auto', color: 'var(--red)' }} onClick={async (e) => { e.preventDefault(); await logout(); navigate('/login'); }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
          {t('admin.logout', 'Cerrar sesión')}
        </a>
      </aside>

      <main className="main-content">
        {/* Top bar with sidebar toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button 
            type="button" 
            className="sidebar-toggle-btn" 
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú de navegación"
          >
            ☰ Menú
          </button>
          <LanguageSwitcher />
        </div>

        <div className="dash-header">
          <div className="dash-welcome">
            <h1>{t('admin.title', 'Panel de Administración')}</h1>
            <p>{t('admin.sub', 'Monitoreo global de la plataforma AgroMarket Urabá')}</p>
          </div>
          <button className="btn-cta" style={{ background: 'var(--primary-dark)' }} onClick={handleGenerateReport}>
            {t('admin.generateReport', 'Generar Reporte Mensual')}
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card color-1">
            <span className="stat-icon-lg"></span>
            <div className="stat-label">{t('admin.stats.totalUsers', 'Total Usuarios')}</div>
            <div className="stat-value" id="statUsuarios">{String(usuarios.length).padStart(2, '0')}</div>
            <div className="stat-trend up">{t('admin.stats.trendUsers', 'Usuarios registrados')}</div>
          </div>
          <div className="stat-card color-2">
            <span className="stat-icon-lg"></span>
            <div className="stat-label">{t('admin.stats.globalProducts', 'Productos Globales')}</div>
            <div className="stat-value" id="statProductos">{String(productos.length).padStart(2, '0')}</div>
            <div className="stat-trend">{t('admin.stats.trendProducts', 'En catálogo')}</div>
          </div>
          <div className="stat-card color-3">
            <span className="stat-icon-lg"></span>
            <div className="stat-label">{t('admin.stats.totalEarnings', 'Ingresos Totales')}</div>
            <div className="stat-value">
              {dashboardData?.ingresos !== undefined && dashboardData?.ingresos !== null
                ? `$${Number(dashboardData.ingresos).toLocaleString('es-CO')}`
                : '—'}
            </div>
            <div className="stat-trend up">{t('admin.stats.trendEarnings', 'Ingresos confirmados')}</div>
          </div>
          <div className="stat-card color-4">
            <span className="stat-icon-lg"></span>
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
                  <div className="table-header"><h3 className="card-title">{t('admin.usersManagement', 'Gestión de Usuarios')}</h3></div>
                  
                  {/* PENDING APPROVALS */}
                  <div style={{ padding: '20px 24px', borderBottom: '1px dashed var(--border)' }}>
                    <h4 style={{ color: 'var(--gold)', marginBottom: '12px', fontSize: '0.95rem', fontWeight: 'bold' }}>Cuentas de Productores Pendientes de Aprobación</h4>
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
                                    Aprobar
                                  </button>
                                  <button className="btn btn-danger btn-sm" style={{ marginLeft: '6px' }} onClick={() => handleRechazarUsuario(u.id)}>
                                    Rechazar
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
                      <input type="text" id="searchUsuarios" placeholder={t('admin.searchUsers', 'Buscar por nombre o correo...')} value={searchUsuariosInput} onChange={(e) => setSearchUsuariosInput(e.target.value)} />
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
                        {usuarios.map((u) => (
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
                                  {u.verificado ? 'Verificado' : 'Verificar'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls for Users */}
                  {totalPagesUsuarios > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '16px 24px', borderTop: '1px solid var(--border-light)' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        disabled={pageUsuarios === 0}
                        onClick={() => setPageUsuarios(p => Math.max(0, p - 1))}
                      >
                        Anterior
                      </button>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                        Página <strong>{pageUsuarios + 1}</strong> de <strong>{totalPagesUsuarios}</strong> ({totalElementsUsuarios} usuarios)
                      </span>
                      <button 
                        className="btn btn-secondary btn-sm"
                        disabled={pageUsuarios >= totalPagesUsuarios - 1}
                        onClick={() => setPageUsuarios(p => p + 1)}
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </div>
              )}
 
              {/* PRODUCTOS */}
              {activeSection === 'productos' && (
                <div className="section active" id="sec-productos">
                  <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <h3 className="card-title">{t('admin.globalInventory', 'Inventario Global')}</h3>
                    <div className="search-box" style={{ maxWidth: '280px', width: '100%', margin: 0 }}>
                      <input 
                        type="text" 
                        placeholder="Buscar productos..." 
                        value={searchProductosInput} 
                        onChange={(e) => setSearchProductosInput(e.target.value)} 
                      />
                    </div>
                  </div>
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
                              <button className="btn btn-secondary btn-sm" style={{ color: 'var(--red)' }} onClick={() => eliminarProducto(p.id)}>{t('admin.delete', 'Eliminar')}</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls for Products */}
                  {totalPagesProductos > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '16px 24px', borderTop: '1px solid var(--border-light)' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        disabled={pageProductos === 0}
                        onClick={() => setPageProductos(p => Math.max(0, p - 1))}
                      >
                        Anterior
                      </button>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                        Página <strong>{pageProductos + 1}</strong> de <strong>{totalPagesProductos}</strong> ({totalElementsProductos} productos)
                      </span>
                      <button 
                        className="btn btn-secondary btn-sm"
                        disabled={pageProductos >= totalPagesProductos - 1}
                        onClick={() => setPageProductos(p => p + 1)}
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* RESEÑAS */}
              {activeSection === 'resenas' && (
                <div className="section active" id="sec-resenas">
                  <div className="table-header"><h3 className="card-title">{t('admin.reviewsModeration', 'Moderación de Reseñas')}</h3></div>
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
                              <button className="btn btn-secondary btn-sm" onClick={() => moderarResena(r.id, true)}>{t('admin.approve', 'Aprobar')}</button>
                              <button className="btn btn-secondary btn-sm" style={{ color: 'var(--red)', marginLeft: '6px' }} onClick={() => moderarResena(r.id, false)}>{t('admin.reject', 'Rechazar')}</button>
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
                  <div className="table-header"><h3 className="card-title">Transacciones en Fideicomiso</h3></div>
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

              {/* FINANZAS */}
              {activeSection === 'finanzas' && (
                <div className="section active" id="sec-finanzas" style={{ padding: '24px' }}>
                  <div className="table-header" style={{ marginBottom: '20px' }}>
                    <h3 className="card-title" style={{ fontSize: '1.25rem', color: 'var(--primary-dark)' }}>Reporte Financiero Global</h3>
                  </div>

                  {loadingFinanzas ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>Cargando datos financieros...</div>
                  ) : errorFinanzas ? (
                    <div style={{ color: 'var(--red)', padding: '20px' }}>{errorFinanzas}</div>
                  ) : finanzasData ? (
                    <div>
                      {/* Financial KPI Cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ background: 'var(--green-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--primary-light)' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-dark)', textTransform: 'uppercase' }}>Ingresos Confirmados</span>
                          <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', margin: '8px 0 0 0' }}>
                            ${Number(finanzasData.totalIngresos || 0).toLocaleString('es-CO')}
                          </h2>
                        </div>
                        <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#b45309', textTransform: 'uppercase' }}>Fondos en Fideicomiso</span>
                          <h2 style={{ fontSize: '1.8rem', color: '#d97706', margin: '8px 0 0 0' }}>
                            ${Number(finanzasData.totalFideicomiso || 0).toLocaleString('es-CO')}
                          </h2>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Payments by Method */}
                        <div>
                          <h4 style={{ marginBottom: '12px', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text)' }}>Por Método de Pago</h4>
                          <div className="table-wrap">
                            <table className="table-responsive" style={{ fontSize: '0.85rem' }}>
                              <thead>
                                <tr>
                                  <th>Método</th>
                                  <th>Transacciones</th>
                                  <th>Monto Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.keys(finanzasData.transaccionesPorMetodo || {}).length === 0 ? (
                                  <tr><td colSpan="3" style={{ textAlign: 'center' }}>No hay transacciones</td></tr>
                                ) : (
                                  Object.keys(finanzasData.transaccionesPorMetodo).map((metodo) => (
                                    <tr key={metodo}>
                                      <td data-label="Método" style={{ fontWeight: 'bold' }}>{metodo.replace('_', ' ')}</td>
                                      <td data-label="Transacciones">{finanzasData.transaccionesPorMetodo[metodo]}</td>
                                      <td data-label="Monto Total">${Number(finanzasData.montoPorMetodo[metodo] || 0).toLocaleString('es-CO')}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Payments by Status */}
                        <div>
                          <h4 style={{ marginBottom: '12px', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text)' }}>Por Estado de Transacción</h4>
                          <div className="table-wrap">
                            <table className="table-responsive" style={{ fontSize: '0.85rem' }}>
                              <thead>
                                <tr>
                                  <th>Estado</th>
                                  <th>Transacciones</th>
                                  <th>Monto Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.keys(finanzasData.transaccionesPorEstado || {}).length === 0 ? (
                                  <tr><td colSpan="3" style={{ textAlign: 'center' }}>No hay transacciones</td></tr>
                                ) : (
                                  Object.keys(finanzasData.transaccionesPorEstado).map((estado) => (
                                    <tr key={estado}>
                                      <td data-label="Estado" style={{ fontWeight: 'bold' }}>{estado.replace('_', ' ')}</td>
                                      <td data-label="Transacciones">{finanzasData.transaccionesPorEstado[estado]}</td>
                                      <td data-label="Monto Total">${Number(finanzasData.montoPorEstado[estado] || 0).toLocaleString('es-CO')}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'right' }}>
                        Total transacciones registradas: <strong>{finanzasData.totalTransacciones}</strong>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Sin datos disponibles.</div>
                  )}
                </div>
              )}

              {/* LOGISTICA */}
              {activeSection === 'logistica' && (
                <div className="section active" id="sec-logistica" style={{ padding: '24px' }}>
                  <div className="table-header" style={{ marginBottom: '20px' }}>
                    <h3 className="card-title" style={{ fontSize: '1.25rem', color: 'var(--primary-dark)' }}>Reporte de Logística y Envíos</h3>
                  </div>

                  {loadingLogistica ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>Cargando datos logísticos...</div>
                  ) : errorLogistica ? (
                    <div style={{ color: 'var(--red)', padding: '20px' }}>{errorLogistica}</div>
                  ) : logisticaData ? (
                    <div>
                      {/* Logistics KPI Cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ background: 'var(--green-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--primary-light)', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--primary-dark)', textTransform: 'uppercase' }}>Total Envíos</span>
                          <h2 style={{ fontSize: '1.6rem', color: 'var(--primary)', margin: '4px 0 0 0' }}>
                            {logisticaData.totalEnvios}
                          </h2>
                        </div>
                        <div style={{ background: '#e0f2fe', padding: '12px', borderRadius: '8px', border: '1px solid #38bdf8', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#0369a1', textTransform: 'uppercase' }}>En Camino</span>
                          <h2 style={{ fontSize: '1.6rem', color: '#0284c7', margin: '4px 0 0 0' }}>
                            {logisticaData.enviosPorEstado?.['EN_CAMINO'] || 0}
                          </h2>
                        </div>
                        <div style={{ background: '#dcfce7', padding: '12px', borderRadius: '8px', border: '1px solid #4ade80', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#15803d', textTransform: 'uppercase' }}>Entregados</span>
                          <h2 style={{ fontSize: '1.6rem', color: '#16a34a', margin: '4px 0 0 0' }}>
                            {logisticaData.enviosPorEstado?.['ENTREGADO'] || 0}
                          </h2>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Shipments by Status */}
                        <div>
                          <h4 style={{ marginBottom: '12px', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text)' }}>Por Estado del Envío</h4>
                          <div className="table-wrap">
                            <table className="table-responsive" style={{ fontSize: '0.85rem' }}>
                              <thead>
                                <tr>
                                  <th>Estado</th>
                                  <th>Envíos</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.keys(logisticaData.enviosPorEstado || {}).length === 0 ? (
                                  <tr><td colSpan="2" style={{ textAlign: 'center' }}>No hay envíos registrados</td></tr>
                                ) : (
                                  Object.keys(logisticaData.enviosPorEstado).map((estado) => (
                                    <tr key={estado}>
                                      <td data-label="Estado" style={{ fontWeight: 'bold' }}>{estado.replace('_', ' ')}</td>
                                      <td data-label="Envíos">{logisticaData.enviosPorEstado[estado]}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Shipments by Carrier */}
                        <div>
                          <h4 style={{ marginBottom: '12px', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text)' }}>Distribución por Transportista</h4>
                          <div className="table-wrap">
                            <table className="table-responsive" style={{ fontSize: '0.85rem' }}>
                              <thead>
                                <tr>
                                  <th>Transportista</th>
                                  <th>Envíos</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.keys(logisticaData.enviosPorTransportista || {}).length === 0 ? (
                                  <tr><td colSpan="2" style={{ textAlign: 'center' }}>No hay envíos registrados</td></tr>
                                ) : (
                                  Object.keys(logisticaData.enviosPorTransportista).map((transportista) => (
                                    <tr key={transportista}>
                                      <td data-label="Transportista" style={{ fontWeight: 'bold' }}>{transportista}</td>
                                      <td data-label="Envíos">{logisticaData.enviosPorTransportista[transportista]}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Sin datos disponibles.</div>
                  )}
                </div>
              )}

              {/* CUPONES */}
              {activeSection === 'cupones' && (
                <div className="section active">
                  <div className="table-header">
                    <h3 className="card-title">Gestión de Cupones de Descuento</h3>
                  </div>

                  <form onSubmit={handleCrearCupon} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '0.95rem', fontWeight: 'bold' }}>Crear Nuevo Cupón</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="form-row">
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.85rem' }}>Código *</label>
                        <input className="form-input" style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }} placeholder="DESCUENTO10" value={nuevoCupon.codigo} onChange={(e) => setNuevoCupon({ ...nuevoCupon, codigo: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.85rem' }}>Tipo *</label>
                        <select className="form-input" style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }} value={nuevoCupon.tipo} onChange={(e) => setNuevoCupon({ ...nuevoCupon, tipo: e.target.value })}>
                          <option value="ENVIO_GRATIS">Envío Gratis</option>
                          <option value="PORCENTAJE">Porcentaje de Descuento</option>
                          <option value="MONTO_FIJO">Monto Fijo</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="form-row">
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.85rem' }}>Valor Descuento / Porcentaje</label>
                        <input type="number" className="form-input" style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }} value={nuevoCupon.valor} onChange={(e) => setNuevoCupon({ ...nuevoCupon, valor: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.85rem' }}>Monto Mínimo Compra</label>
                        <input type="number" className="form-input" style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }} value={nuevoCupon.montoMinimo} onChange={(e) => setNuevoCupon({ ...nuevoCupon, montoMinimo: e.target.value })} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="form-row">
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.85rem' }}>ID Usuario (Opcional, vacío para global)</label>
                        <input type="text" className="form-input" style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }} placeholder="Opcional" value={nuevoCupon.usuarioId} onChange={(e) => setNuevoCupon({ ...nuevoCupon, usuarioId: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.85rem' }}>Fecha Expiración (Opcional)</label>
                        <input type="date" className="form-input" style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }} value={nuevoCupon.fechaExpiracion} onChange={(e) => setNuevoCupon({ ...nuevoCupon, fechaExpiracion: e.target.value })} />
                      </div>
                    </div>

                    <button className="btn btn-primary btn-sm" type="submit" style={{ alignSelf: 'flex-start', marginTop: '6px' }}>Crear Cupón</button>
                  </form>

                  <div className="table-wrap">
                    <table className="table-responsive">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Tipo</th>
                          <th>Valor</th>
                          <th>Monto Min.</th>
                          <th>Usuario ID</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todosCupones.length === 0 ? (
                          <tr><td colSpan="6" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>No hay cupones registrados.</td></tr>
                        ) : (
                          todosCupones.map((c) => (
                            <tr key={c.id}>
                              <td data-label="Código" style={{ fontWeight: 'bold' }}>{c.codigo}</td>
                              <td data-label="Tipo">{c.tipo}</td>
                              <td data-label="Valor">{c.tipo === 'PORCENTAJE' ? `${c.valor}%` : `$${Number(c.valor).toLocaleString('es-CO')}`}</td>
                              <td data-label="Monto Min.">${Number(c.montoMinimo || 0).toLocaleString('es-CO')}</td>
                              <td data-label="Usuario ID">{c.usuarioId || 'Global'}</td>
                              <td data-label="Acciones">
                                <button className="btn btn-danger btn-sm" onClick={() => handleEliminarCupon(c.id)}>Eliminar</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CONFIGURACION */}
              {activeSection === 'configuracion' && (
                <div className="section active">
                  <div className="table-header">
                    <h3 className="card-title">Configuración del Sistema</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Costo envío */}
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <h4 style={{ margin: 0, marginBottom: '12px', color: 'var(--primary-dark)', fontSize: '0.95rem', fontWeight: 'bold' }}>Costos de Envío</h4>
                      <div className="form-group" style={{ maxWidth: '300px' }}>
                        <label className="form-label" style={{ fontSize: '0.85rem' }}>Costo de Envío Estándar Nacional (COP)</label>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                          <input type="number" className="form-input" value={costoEnvioNacional} onChange={(e) => setCostoEnvioNacional(Number(e.target.value))} />
                          <button className="btn btn-primary" onClick={() => { localStorage.setItem('costo_envio', costoEnvioNacional); alert('Costo de envío guardado.'); }}>Guardar</button>
                        </div>
                      </div>
                    </div>

                    {/* Mantenimiento mode */}
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <h4 style={{ margin: 0, marginBottom: '12px', color: 'var(--primary-dark)', fontSize: '0.95rem', fontWeight: 'bold' }}>Modo Mantenimiento</h4>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>Activar el modo de mantenimiento bloquea el acceso de clientes a la tienda, permitiendo únicamente el acceso de administradores.</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="checkbox" checked={mantenimientoMode} onChange={(e) => { setMantenimientoMode(e.target.checked); localStorage.setItem('mantenimiento_mode', e.target.checked); alert(`Modo mantenimiento ${e.target.checked ? 'ACTIVADO' : 'DESACTIVADO'}.`); }} id="chkMantenimiento" style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                        <label htmlFor="chkMantenimiento" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Activar Modo Mantenimiento</label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SIDEBAR INFO ADMIN */}
            <div className="side-info">
              <div className="card-table" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 className="card-title" style={{ marginBottom: '16px' }}>{t('admin.topProducers', 'Top Productores')}</h3>
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
