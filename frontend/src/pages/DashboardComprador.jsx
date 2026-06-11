// File: frontend/src/components/DashboardComprador.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import { badgeEstado, formatearPrecio, formatearFecha, showToast } from '../utils/ui.js';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { useTranslation } from 'react-i18next';
import '../styles/styles.css';

function BadgeEstado({ estado }) {
  const { label, bg, fg } = badgeEstado(estado);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '4px 10px',
      borderRadius: '999px', background: bg, color: fg,
      fontSize: '.78rem', fontWeight: 700, letterSpacing: '.02em',
    }}>
      {label}
    </span>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '16px',
      border: '1px solid rgba(45,106,79,.12)',
      padding: '20px 24px',
      boxShadow: '0 2px 8px rgba(0,0,0,.04)',
    }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1a3a2a', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function FacturaModal({ factura, onClose }) {
  const { t } = useTranslation();
  if (!factura) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', maxWidth: '420px', width: '100%', margin: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontWeight: 800 }}>{t('dashboard.invoiceTitle', 'Factura')}</h3>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 0, fontSize: '1.4rem', cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>
        <div style={{ borderRadius: '12px', border: '1px dashed #d1d5db', padding: '20px', display: 'grid', gap: '10px' }}>
          {[
            [t('dashboard.invoiceNumber', 'Nº Factura'), factura.numeroFactura || `FAC-${factura.id}`],
            [t('dashboard.date', 'Fecha'), formatearFecha(factura.fechaEmision)],
            [t('dashboard.order', 'Pedido'), `#${factura.pedidoId}`],
            [t('catalogo.subtotal', 'Subtotal'), formatearPrecio(factura.subtotal)],
            [t('dashboard.tax', 'Impuesto (19%)'), formatearPrecio(factura.impuesto)],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: '#6b7280' }}>{k}</span>
              <span>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #2d6a4f', paddingTop: '10px', fontWeight: 800 }}>
            <span>{t('checkout.totalAPagar', 'Total a pagar')}</span>
            <span style={{ color: '#2d6a4f' }}>{formatearPrecio(factura.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCompradorContent() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [section, setSection] = useState('overview');
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroPed, setFiltroPed] = useState('');
  const [factura, setFactura] = useState(null);

  const firstName = (user?.nombre || 'Usuario').split(' ').filter(Boolean)[0] || 'Usuario';

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    setLoading(true);
    try {
      const [productosResp, pedidosResp, contactosResp] = await Promise.all([
        api.getProductos({ page: 0, size: 100 }),
        api.getMisCompras(),
        api.getContactos().catch(() => []),
      ]);
      setProductos(productosResp?.content || productosResp || []);
      setPedidos(pedidosResp || []);
      setContactos(contactosResp || []);
    } catch (err) {
      showToast(err?.message || t('dashboard.loadError', 'No se pudo cargar el panel.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const cancelarPed = async (id) => {
    if (!window.confirm(t('dashboard.cancelOrderConfirm', '¿Deseas cancelar este pedido?'))) return;
    try {
      await api.cancelarPedido(id);
      setPedidos((prev) => prev.filter((p) => String(p.id) !== String(id)));
      showToast(t('dashboard.orderCancelled', 'Pedido cancelado.'), 'success');
    } catch (err) {
      showToast(err?.message || t('dashboard.cancelOrderError', 'No se pudo cancelar el pedido.'), 'error');
    }
  };

  const verFactura = async (id) => {
    try {
      const f = await api.getFacturaPorPedido(id);
      setFactura(f);
    } catch (err) {
      showToast(err?.message || t('dashboard.openInvoiceError', 'No se pudo abrir la factura.'), 'error');
    }
  };

  const totalInversion = pedidos
    .filter((p) => String(p.estado).toUpperCase() !== 'CANCELADO')
    .reduce((sum, p) => sum + Number(p.total || 0), 0);
  const entregados = pedidos.filter((p) => String(p.estado).toUpperCase() === 'ENTREGADO').length;

  const pedidosFiltrados = filtroPed
    ? pedidos.filter((p) => String(p.estado).toUpperCase() === String(filtroPed).toUpperCase())
    : pedidos;

  const navItems = [
    { id: 'overview', icon: '🏠', label: t('nav.inicio', 'Inicio') },
    { id: 'pedidos', icon: '📦', label: t('dashboard.ordersSection', 'Pedidos') },
    { id: 'mensajes', icon: '💬', label: t('nav.messages', 'Mensajes') },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8faf8' }}>
      {/* Sidebar */}
      <aside style={{ width: '240px', background: '#fff', borderRight: '1px solid rgba(45,106,79,.12)', display: 'flex', flexDirection: 'column', padding: '24px 16px' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'linear-gradient(135deg,#2d6a4f,#40916c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: '1rem', marginBottom: '8px',
          }}>
            {(user?.nombre || 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div style={{ fontWeight: 700, color: '#1a3a2a', fontSize: '0.95rem' }}>{user?.nombre || t('general.user', 'Usuario')}</div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{t('auth.buyer', 'Comprador')}</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              style={{
                padding: '10px 14px', borderRadius: '12px', border: 0,
                background: section === item.id ? 'rgba(45,106,79,.1)' : 'transparent',
                color: section === item.id ? '#2d6a4f' : '#374151',
                fontWeight: section === item.id ? 700 : 500,
                cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem',
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <a href="/catalogo.html" style={{ display: 'block', padding: '10px 14px', borderRadius: '12px', background: '#2d6a4f', color: '#fff', textDecoration: 'none', fontWeight: 700, textAlign: 'center', fontSize: '0.9rem' }}>
            {t('dashboard.goToCatalog', '🛒 Ir al catálogo')}
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {section === 'overview' && (
          <>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#1a3a2a' }}>
                {t('dashboard.helloAgain', { defaultValue: '¡Hola de nuevo, {{name}}! 👋', name: firstName })}
              </h1>
              <p style={{ color: '#6b7280', marginTop: '4px', fontSize: '0.9rem' }}>
                {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <StatCard label={t('dashboard.totalOrders', 'Pedidos totales')} value={String(pedidos.length).padStart(2, '0')} icon="📦" />
              <StatCard label={t('dashboard.totalInvested', 'Total invertido')} value={formatearPrecio(totalInversion)} icon="💰" />
              <StatCard label={t('dashboard.deliveredCount', 'Entregados')} value={String(entregados).padStart(2, '0')} icon="✅" />
              <StatCard label={t('dashboard.contactsCount', 'Contactos')} value={String(contactos.length).padStart(2, '0')} icon="💬" />
            </div>

            {/* Recent products */}
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>{t('dashboard.recommendedProducts', 'Productos recomendados')}</h2>
            {loading ? (
              <div style={{ color: '#6b7280' }}>{t('general.cargando', 'Cargando...')}</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {productos.slice(0, 4).map((p) => (
                  <div key={p.id} style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(45,106,79,.1)' }}>
                    <img
                      src={p.imagenUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'}
                      alt={p.nombre}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'; }}
                      style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.nombre}</div>
                      <div style={{ color: '#2d6a4f', fontWeight: 800, marginTop: '4px' }}>{formatearPrecio(p.precio)}/kg</div>
                      <a href="/catalogo.html" style={{ display: 'block', marginTop: '8px', padding: '8px', borderRadius: '8px', background: '#2d6a4f', color: '#fff', textDecoration: 'none', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                        {t('dashboard.buyBtn', '🛒 Comprar')}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent orders */}
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>{t('dashboard.recentPurchases', 'Compras recientes')}</h2>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(45,106,79,.12)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8faf8' }}>
                    {[t('dashboard.idHeader', 'ID'), t('dashboard.productHeader', 'Producto'), t('catalogo.total', 'Total'), t('dashboard.statusHeader', 'Estado'), t('dashboard.actionsHeader', 'Acciones')].map((h) => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pedidos.slice(0, 5).map((p) => (
                    <tr key={p.id} style={{ borderTop: '1px solid rgba(45,106,79,.08)' }}>
                      <td style={{ padding: '12px 16px', color: '#6b7280', fontWeight: 600 }}>#{p.id}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>{p.productoNombre}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{formatearPrecio(p.total)}</td>
                      <td style={{ padding: '12px 16px' }}><BadgeEstado estado={p.estado} /></td>
                      <td style={{ padding: '12px 16px' }}>
                        {(String(p.estado).toUpperCase() === 'ENVIADO' || String(p.estado).toUpperCase() === 'PREPARANDO') && (
                          <a href="/envios.html" style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '8px', background: '#eff6ff', color: '#1d4ed8', textDecoration: 'none', fontWeight: 600 }}>{t('dashboard.trackBtn', 'Rastrear')}</a>
                        )}
                        {String(p.estado).toUpperCase() === 'ENTREGADO' && (
                          <button type="button" onClick={() => verFactura(p.id)} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '8px', background: '#f0fdf4', color: '#166534', border: 0, cursor: 'pointer', fontWeight: 600 }}>{t('dashboard.invoiceBtn', 'Factura')}</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {pedidos.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                        {t('dashboard.noOrdersYet', 'Aún no has realizado ningún pedido.')} <a href="/catalogo.html" style={{ color: '#2d6a4f', fontWeight: 700 }}>{t('dashboard.exploreCatalog', 'Explorar catálogo')}</a>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {section === 'pedidos' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1a3a2a' }}>{t('dashboard.orderHistoryTitle', 'Historial de Pedidos')}</h1>
              <select
                value={filtroPed}
                onChange={(e) => setFiltroPed(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(45,106,79,.2)', fontSize: '0.9rem', background: '#fff' }}
              >
                <option value="">{t('dashboard.allStates', 'Todos los estados')}</option>
                {['PENDIENTE', 'PREPARANDO', 'ENVIADO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'].map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(45,106,79,.12)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8faf8' }}>
                    {[t('dashboard.idHeader', 'ID'), t('dashboard.productHeader', 'Producto'), t('dashboard.quantityHeader', 'Cantidad'), t('catalogo.total', 'Total'), t('dashboard.statusHeader', 'Estado'), t('dashboard.actionsHeader', 'Acciones')].map((h) => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pedidosFiltrados.map((p) => (
                    <tr key={p.id} style={{ borderTop: '1px solid rgba(45,106,79,.08)' }}>
                      <td style={{ padding: '12px 16px', color: '#6b7280', fontWeight: 600 }}>#{p.id}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>{p.productoNombre}</td>
                      <td style={{ padding: '12px 16px' }}>{p.cantidad} kg</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{formatearPrecio(p.total)}</td>
                      <td style={{ padding: '12px 16px' }}><BadgeEstado estado={p.estado} /></td>
                      <td style={{ padding: '12px 16px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {(String(p.estado).toUpperCase() === 'ENVIADO' || String(p.estado).toUpperCase() === 'PREPARANDO' || String(p.estado).toUpperCase() === 'EN_CAMINO') && (
                          <a href="/envios.html" style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '8px', background: '#eff6ff', color: '#1d4ed8', textDecoration: 'none', fontWeight: 600 }}>{t('dashboard.trackBtn', 'Rastrear')}</a>
                        )}
                        {String(p.estado).toUpperCase() === 'ENTREGADO' && (
                          <button type="button" onClick={() => verFactura(p.id)} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '8px', background: '#f0fdf4', color: '#166534', border: 0, cursor: 'pointer', fontWeight: 600 }}>{t('dashboard.invoiceBtn', 'Factura')}</button>
                        )}
                        {String(p.estado).toUpperCase() === 'PENDIENTE' && (
                          <button type="button" onClick={() => cancelarPed(p.id)} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', border: 0, cursor: 'pointer', fontWeight: 600 }}>{t('general.cancelar', 'Cancelar')}</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {pedidosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                        {t('dashboard.noOrdersWithFilter', 'No hay pedidos con este filtro.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {section === 'mensajes' && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <h2 style={{ fontWeight: 800, color: '#1a3a2a', marginBottom: '8px' }}>{t('nav.messages', 'Mensajes')}</h2>
            <p>{t('dashboard.manageChatsDesc', 'Gestiona tus conversaciones con productores.')}</p>
            <a href="/mensajeria.html" style={{ display: 'inline-block', marginTop: '16px', padding: '12px 24px', borderRadius: '12px', background: '#2d6a4f', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
              {t('dashboard.goToMessaging', 'Ir a mensajería')}
            </a>
          </div>
        )}
      </main>

      {factura && <FacturaModal factura={factura} onClose={() => setFactura(null)} />}
    </div>
  );
}

export default function DashboardComprador() {
  return (
    <>
      <Navbar />
      <ProtectedRoute allowedRoles={['comprador']}>
        <DashboardCompradorContent />
      </ProtectedRoute>
    </>
  );
}
