// File: frontend/src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { badgeEstado, formatearPrecio, showToast } from '../utils/ui.js';
import Navbar from '../components/Navbar.jsx';

export default function Admin() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('usuarios');
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [resenas, setResenas] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const firstName = (user?.nombre || 'Admin').split(' ').filter(Boolean)[0] || 'Admin';

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [userList, prodList, dashData] = await Promise.all([
        api.getUsuarios(),
        api.getProductos({ page: 0, size: 100 }),
        api.getDashboard().catch(() => ({ totalUsuarios: 0, totalProductos: 0, ingresos: 0 }))
      ]);

      const resolvedProds = prodList?.content || prodList || [];
      setUsuarios(userList || []);
      setProductos(resolvedProds);
      setDashboard(dashData);

      // Load reviews for first 10 products
      try {
        const reviewLists = await Promise.all(
          resolvedProds.slice(0, 10).map(async (p) => {
            try {
              const r = await api.getResenas(p.id);
              return r.map((item) => ({ ...item, productoNombre: p.nombre }));
            } catch {
              return [];
            }
          })
        );
        setResenas(reviewLists.flat());
      } catch (err) {
        console.warn("Error loading reviews", err);
      }
    } catch (error) {
      showToast(error?.message || t('dashboard.loadError', 'No se pudo cargar el panel.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleUsuario = async (id, activo) => {
    try {
      if (activo) {
        await api.deshabilitarUsuario(id);
      } else {
        await api.habilitarUsuario(id);
      }
      showToast(t('admin.userUpdated', 'Usuario actualizado correctamente.'), 'success');
      cargarDatos();
    } catch (error) {
      showToast(error?.message || t('admin.userUpdateError', 'No se pudo actualizar el usuario.'), 'error');
    }
  };

  const aprobarUsuario = async (id) => {
    try {
      await api.aprobarUsuario(id);
      showToast(t('admin.producerApproved', 'Productor aprobado correctamente.'), 'success');
      cargarDatos();
    } catch (error) {
      showToast(error?.message || t('admin.producerApprovalError', 'No se pudo aprobar el productor.'), 'error');
    }
  };

  const eliminarProductoGlobal = async (id) => {
    if (!window.confirm(t('admin.deleteProductConfirm', '¿Estás seguro de eliminar este producto del catálogo global?'))) return;
    try {
      await api.eliminarProducto(id);
      showToast(t('admin.productDeleted', 'Producto eliminado de AgroMarket.'), 'success');
      cargarDatos();
    } catch (error) {
      showToast(error?.message || t('admin.deleteProductError', 'No se pudo eliminar el producto.'), 'error');
    }
  };

  const eliminarResenaGlobal = async (id) => {
    if (!window.confirm(t('admin.deleteReviewConfirm', '¿Eliminar esta reseña permanentemente de la plataforma?'))) return;
    try {
      await api.eliminarResena(id);
      showToast(t('admin.reviewDeleted', 'Reseña eliminada del sistema.'), 'success');
      cargarDatos();
    } catch (error) {
      showToast(error?.message || t('admin.deleteReviewError', 'No se pudo eliminar la reseña.'), 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredUsuarios = usuarios.filter((u) => 
    (u.nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.correo || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topProducers = usuarios.filter((u) => String(u.rol).toUpperCase() === 'PRODUCTOR').slice(0, 4);

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8faf8' }}>
        {/* Sidebar */}
        <aside style={{ width: '240px', background: '#fff', borderRight: '1px solid rgba(45,106,79,.12)', display: 'flex', flexDirection: 'column', padding: '24px 16px' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#c0392b,#e74c3c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.2rem', marginBottom: '8px' }}>
              {(user?.nombre || 'A').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ fontWeight: 700, color: '#1a3a2a', fontSize: '0.95rem' }}>{user?.nombre || t('admin.defaultUser', 'Administrador')}</div>
            <div style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>{t('nav.users', 'Admin')}</div>
          </div>

          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '8px' }}>
            {t('admin.controlPanel', 'Panel de Control')}
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
            <button
              onClick={() => setActiveSection('usuarios')}
              style={{
                padding: '10px 14px', borderRadius: '12px', border: 0,
                background: activeSection === 'usuarios' ? 'rgba(45,106,79,.1)' : 'transparent',
                color: activeSection === 'usuarios' ? '#2d6a4f' : '#374151',
                fontWeight: activeSection === 'usuarios' ? 700 : 500,
                cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem'
              }}
            >
              <span>👥</span> {t('admin.usersLink', 'Usuarios')}
            </button>
            <button
              onClick={() => setActiveSection('productos')}
              style={{
                padding: '10px 14px', borderRadius: '12px', border: 0,
                background: activeSection === 'productos' ? 'rgba(45,106,79,.1)' : 'transparent',
                color: activeSection === 'productos' ? '#2d6a4f' : '#374151',
                fontWeight: activeSection === 'productos' ? 700 : 500,
                cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem'
              }}
            >
              <span>📦</span> {t('admin.productsLink', 'Productos')}
            </button>
            <button
              onClick={() => setActiveSection('resenas')}
              style={{
                padding: '10px 14px', borderRadius: '12px', border: 0,
                background: activeSection === 'resenas' ? 'rgba(45,106,79,.1)' : 'transparent',
                color: activeSection === 'resenas' ? '#2d6a4f' : '#374151',
                fontWeight: activeSection === 'resenas' ? 700 : 500,
                cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem'
              }}
            >
              <span>⭐</span> {t('admin.reviewsLink', 'Moderación')}
            </button>
          </nav>

          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px', marginTop: 'auto' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '12px', border: 0,
                background: 'transparent', color: '#dc2626', fontWeight: 700,
                cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem'
              }}
            >
              <span>🔒</span> {t('nav.cerrarSesion', 'Cerrar sesión')}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#1a3a2a' }}>
                {t('admin.welcome', { defaultValue: '¡Hola, {{name}}! 👋', name: firstName })}
              </h1>
              <p style={{ color: '#6b7280', marginTop: '4px', fontSize: '0.9rem' }}>
                {t('admin.subtitle', 'Monitoreo global de la plataforma AgroMarket.')}
              </p>
            </div>
            <button
              onClick={() => alert(t('admin.generatingReportAlert', 'Generando reporte PDF...'))}
              style={{ padding: '10px 20px', borderRadius: '12px', border: 0, background: '#1e3a1e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
            >
              {t('admin.monthlyReportBtn', 'Generar Reporte Mensual 📊')}
            </button>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid rgba(45,106,79,.12)' }}>
              <span style={{ fontSize: '1.5rem' }}>👥</span>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '8px' }}>{t('admin.totalUsers', 'Total Usuarios')}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a3a2a', margin: '4px 0' }}>
                {dashboard ? String(dashboard.totalUsuarios || 0).padStart(2, '0') : '--'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>{t('admin.registeredInApp', 'Registrados en AgroMarket')}</div>
            </div>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid rgba(45,106,79,.12)' }}>
              <span style={{ fontSize: '1.5rem' }}>📦</span>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '8px' }}>{t('admin.globalProducts', 'Productos Globales')}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a3a2a', margin: '4px 0' }}>
                {dashboard ? String(dashboard.totalProductos || 0).padStart(2, '0') : '--'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>{t('admin.publishedCount', 'Publicados e inventariados')}</div>
            </div>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid rgba(45,106,79,.12)' }}>
              <span style={{ fontSize: '1.5rem' }}>💰</span>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '8px' }}>{t('admin.totalRevenue', 'Ingresos Totales')}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a3a2a', margin: '4px 0' }}>
                {dashboard ? formatearPrecio(dashboard.ingresos || 0) : '--'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>{t('admin.appTransactions', 'Transacciones en la app')}</div>
            </div>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid rgba(45,106,79,.12)' }}>
              <span style={{ fontSize: '1.5rem' }}>⭐</span>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '8px' }}>{t('admin.moderationAlerts', 'Alertas Moderación')}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a3a2a', margin: '4px 0' }}>
                {String(resenas.length).padStart(2, '0')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>{t('admin.reviewsLoaded', 'Reseñas cargadas')}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
            {/* Main Cards table */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(45,106,79,.12)', overflow: 'hidden', padding: '24px' }}>
              {activeSection === 'usuarios' && (
                <div>
                  <h3 style={{ margin: '0 0 16px', fontWeight: 800 }}>👥 {t('admin.usersManagement', 'Gestión de Usuarios')}</h3>
                  <div style={{ marginBottom: '16px' }}>
                    <input
                      type="text"
                      placeholder={t('admin.searchPlaceholder', 'Buscar por nombre o correo...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(45,106,79,.2)', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8faf8', borderBottom: '2px solid rgba(45,106,79,.08)' }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>{t('auth.nombre', 'Nombre')}</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>{t('auth.email', 'Correo')}</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>{t('admin.roleHeader', 'Rol')}</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>{t('dashboard.statusHeader', 'Estado')}</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>{t('dashboard.actionsHeader', 'Acciones')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsuarios.map((u) => {
                          const esProductor = String(u.rol).toUpperCase() === 'PRODUCTOR';
                          const labelEstado = esProductor && !u.aprobado
                            ? t('admin.pendingApproval', '🟠 Pendiente aprobación')
                            : (u.activo ? t('admin.active', '🟢 Activo') : t('admin.inactive', '🟡 Inactivo'));

                          return (
                            <tr key={u.id} style={{ borderBottom: '1px solid rgba(45,106,79,.08)' }}>
                              <td style={{ padding: '12px' }}><strong>{u.nombre}</strong></td>
                              <td style={{ padding: '12px' }}>{u.correo}</td>
                              <td style={{ padding: '12px' }}>
                                <span style={{
                                  padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                                  background: esProductor ? '#eff6ff' : '#f0fdf4', color: esProductor ? '#1e40af' : '#166534'
                                }}>
                                  {String(u.rol).toLowerCase()}
                                </span>
                              </td>
                              <td style={{ padding: '12px', fontSize: '0.85rem' }}>{labelEstado}</td>
                              <td style={{ padding: '12px', display: 'flex', gap: '6px' }}>
                                {esProductor && !u.aprobado && (
                                  <button
                                    onClick={() => aprobarUsuario(u.id)}
                                    style={{ padding: '4px 8px', borderRadius: '6px', border: 0, background: '#2d6a4f', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                                  >
                                    {t('admin.approveBtn', 'Aprobar')}
                                  </button>
                                )}
                                <button
                                  onClick={() => toggleUsuario(u.id, u.activo)}
                                  style={{
                                    padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db',
                                    background: '#fff', color: u.activo ? '#dc2626' : '#2d6a4f', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600
                                  }}
                                >
                                  {u.activo ? t('admin.blockBtn', 'Bloquear') : t('admin.enableBtn', 'Habilitar')}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredUsuarios.length === 0 && (
                          <tr>
                            <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                              {t('admin.noUsersFound', 'No hay usuarios registrados.')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSection === 'productos' && (
                <div>
                  <h3 style={{ margin: '0 0 16px', fontWeight: 800 }}>📦 {t('admin.globalInventory', 'Inventario Global')}</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8faf8', borderBottom: '2px solid rgba(45,106,79,.08)' }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>{t('dashboard.productHeader', 'Producto')}</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>{t('dashboard.buyerHeader', 'Productor')}</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>{t('dashboard.pricePerKgHeader', 'Precio/kg')}</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>{t('dashboard.stockHeader', 'Stock')}</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>{t('dashboard.actionsHeader', 'Acciones')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productos.map((p) => (
                          <tr key={p.id} style={{ borderBottom: '1px solid rgba(45,106,79,.08)' }}>
                            <td style={{ padding: '12px' }}><strong>{p.nombre}</strong></td>
                            <td style={{ padding: '12px' }}>{p.productorNombre || '-'}</td>
                            <td style={{ padding: '12px', fontWeight: 600 }}>{formatearPrecio(p.precio)}</td>
                            <td style={{ padding: '12px' }}>{p.cantidadDisponible} kg</td>
                            <td style={{ padding: '12px' }}>
                              <button
                                onClick={() => eliminarProductoGlobal(p.id)}
                                style={{ padding: '4px 8px', borderRadius: '6px', border: 0, background: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                              >
                                {t('general.eliminar', 'Eliminar')}
                              </button>
                            </td>
                          </tr>
                        ))}
                        {productos.length === 0 && (
                          <tr>
                            <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                              {t('admin.noProductsFound', 'Sin productos en el inventario global.')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSection === 'resenas' && (
                <div>
                  <h3 style={{ margin: '0 0 16px', fontWeight: 800 }}>⭐ {t('admin.reviewsModeration', 'Moderación de Reseñas')}</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8faf8', borderBottom: '2px solid rgba(45,106,79,.08)' }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>{t('dashboard.buyerHeader', 'Usuario')}</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>{t('admin.ratingHeader', 'Calificación')}</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>{t('admin.commentHeader', 'Comentario')}</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>{t('dashboard.productHeader', 'Producto')}</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>{t('dashboard.actionsHeader', 'Acciones')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resenas.map((r) => (
                          <tr key={r.id} style={{ borderBottom: '1px solid rgba(45,106,79,.08)' }}>
                            <td style={{ padding: '12px' }}><strong>{r.compradorNombre || 'Comprador'}</strong></td>
                            <td style={{ padding: '12px', color: '#fbbf24', fontWeight: 'bold' }}>
                              {'★'.repeat(Number(r.calificacion || 0))}
                            </td>
                            <td style={{ padding: '12px', fontStyle: 'italic' }}>"{r.comentario}"</td>
                            <td style={{ padding: '12px', fontSize: '0.8rem', color: '#6b7280' }}>{r.productoNombre || 'Producto'}</td>
                            <td style={{ padding: '12px' }}>
                              <button
                                onClick={() => eliminarResenaGlobal(r.id)}
                                style={{ padding: '4px 8px', borderRadius: '6px', border: 0, background: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                              >
                                {t('general.eliminar', 'Eliminar')}
                              </button>
                            </td>
                          </tr>
                        ))}
                        {resenas.length === 0 && (
                          <tr>
                            <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                              {t('admin.noReviewsFound', 'No hay reseñas para moderar.')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Info Admin */}
            <div style={{ display: 'grid', gap: '24px' }}>
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(45,106,79,.12)', padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px', fontWeight: 800 }}>{t('admin.topProducersTitle', 'Top Productores 🏆')}</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {topProducers.map((tp) => (
                    <li
                      key={tp.id}
                      style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6', color: '#374151' }}
                    >
                      <span>{tp.nombre}</span>
                      <span style={{ fontWeight: 600, color: '#2d6a4f' }}>-</span>
                    </li>
                  ))}
                  {topProducers.length === 0 && (
                    <li style={{ padding: '8px 0', color: '#9ca3af' }}>{t('admin.noProducersHighlighted', 'No hay productores destacados')}</li>
                  )}
                </ul>
              </div>

              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(45,106,79,.12)', padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px', fontWeight: 800 }}>{t('admin.chartTitle', 'Ingresos Semestrales')}</h3>
                <div style={{ height: '120px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
                  {[
                    { val: '35%', lbl: 'Ene' },
                    { val: '50%', lbl: 'Feb' },
                    { val: '65%', lbl: 'Mar' },
                    { val: '75%', lbl: 'Abr' },
                    { val: '90%', lbl: 'May' },
                    { val: '98%', lbl: 'Jun', highlight: true }
                  ].map((bar, idx) => (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        height: bar.val,
                        background: bar.highlight ? '#52b788' : '#2d6a4f',
                        borderRadius: '4px 4px 0 0',
                        position: 'relative',
                        cursor: 'pointer'
                      }}
                      title={`${bar.lbl}: ${bar.val}`}
                    >
                      <span style={{ position: 'absolute', bottom: '-24px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: '#6b7280', fontWeight: 600 }}>
                        {bar.lbl}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}