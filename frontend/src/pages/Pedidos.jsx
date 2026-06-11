// File: frontend/src/pages/Pedidos.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { badgeEstado, formatearPrecio, formatearFecha, showToast } from '../utils/ui.js';
import Navbar from '../components/Navbar.jsx';
import '../styles/styles.css';

export default function Pedidos() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [loading, setLoading] = useState(true);
  const [factura, setFactura] = useState(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('success') === 'true') {
      setShowSuccessBanner(true);
    }
    cargarPedidos();
  }, [location]);

  const cargarPedidos = async () => {
    setLoading(true);
    try {
      const data = await api.getMisCompras();
      setPedidos(data || []);
    } catch (error) {
      showToast(error?.message || t('pedidos.loadError', 'No se pudieron cargar los pedidos.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const cancelarPedido = async (id) => {
    if (!window.confirm(t('pedidos.cancelConfirm', '¿Estás seguro de que deseas cancelar este pedido?'))) return;
    try {
      await api.cancelarPedido(id);
      setPedidos((prev) => prev.filter((p) => String(p.id) !== String(id)));
      showToast(t('dashboard.orderCancelled', 'Pedido cancelado.'), 'success');
    } catch (error) {
      showToast(error?.message || t('dashboard.cancelOrderError', 'No se pudo cancelar el pedido.'), 'error');
    }
  };

  const verFactura = async (id) => {
    try {
      const data = await api.getFacturaPorPedido(id);
      setFactura(data);
    } catch (error) {
      showToast(error?.message || t('dashboard.openInvoiceError', 'No se pudo abrir la factura.'), 'error');
    }
  };

  const enviarFacturaCorreo = () => {
    alert(t('pedidos.invoiceSentSuccess', 'Factura enviada al correo registrado exitosamente.'));
  };

  const filteredPedidos = filtroEstado
    ? pedidos.filter((p) => String(p.estado).toUpperCase() === String(filtroEstado).toUpperCase())
    : pedidos;

  return (
    <>
      <Navbar />
      <main style={{ padding: '28px 32px', maxWidth: '1280px', margin: '0 auto' }}>
        {showSuccessBanner && (
          <div style={{
            background: '#eef7ee', border: '1px solid #1a5c2a', borderRadius: '12px',
            padding: '14px 18px', marginBottom: '20px', color: '#1a5c2a',
            fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            ✅ {t('pedidos.successBanner', '¡Pedido realizado con éxito! Ya está siendo procesado por el productor.')}
          </div>
        )}

        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a3a2a', margin: 0 }}>
            🧾 {t('pedidos.title', 'Mis Pedidos')}
          </h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(45,106,79,.2)', fontSize: '0.9rem', background: '#fff', width: '170px' }}
            >
              <option value="">{t('dashboard.allStates', 'Todos los estados')}</option>
              <option value="PENDIENTE">{t('states.pending', 'Pendiente')}</option>
              <option value="ENVIADO">{t('states.onWay', 'Enviado')}</option>
              <option value="ENTREGADO">{t('states.delivered', 'Entregado')}</option>
              <option value="CANCELADO">{t('states.cancelled', 'Cancelado')}</option>
            </select>
            <Link to="/catalogo" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}>
              {t('pedidos.newOrderBtn', '+ Nuevo pedido')}
            </Link>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            {t('general.cargando', 'Cargando...')}
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(45,106,79,.12)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8faf8' }}>
                  {[t('dashboard.idHeader', 'ID'), t('dashboard.productHeader', 'Producto'), t('auth.producer', 'Productor'), t('dashboard.quantityHeader', 'Cantidad'), t('catalogo.total', 'Total'), t('dashboard.statusHeader', 'Estado'), t('dashboard.actionsHeader', 'Acciones')].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPedidos.map((pedido) => {
                  const estadoUpper = String(pedido.estado).toUpperCase();
                  const badge = badgeEstado(pedido.estado);
                  return (
                    <tr key={pedido.id} style={{ borderTop: '1px solid rgba(45,106,79,.08)' }}>
                      <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '.82rem' }}>#{pedido.id}</td>
                      <td style={{ padding: '12px 16px' }}><strong>{pedido.productoNombre}</strong></td>
                      <td style={{ padding: '12px 16px' }}>{pedido.productorNombre || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>{pedido.cantidad} kg</td>
                      <td style={{ padding: '12px 16px', color: '#2d7a3a', fontWeight: '600' }}>{formatearPrecio(pedido.total)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '999px', background: badge.bg, color: badge.fg, fontSize: '.78rem', fontWeight: 700 }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {estadoUpper === 'PENDIENTE' && (
                          <button
                            onClick={() => cancelarPedido(pedido.id)}
                            style={{ padding: '6px 12px', borderRadius: '8px', border: 0, background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                          >
                            {t('pedidos.cancelBtn', '✕ Cancelar')}
                          </button>
                        )}
                        {estadoUpper === 'ENTREGADO' && (
                          <button
                            onClick={() => verFactura(pedido.id)}
                            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                          >
                            {t('pedidos.viewInvoiceBtn', '🧾 Ver factura')}
                          </button>
                        )}
                        {estadoUpper !== 'PENDIENTE' && estadoUpper !== 'ENTREGADO' && (
                          <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{t('pedidos.noActions', 'Ninguna')}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredPedidos.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                      {t('dashboard.noOrdersWithFilter', 'No hay pedidos con este filtro.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Invoice Modal */}
      {factura && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', maxWidth: '480px', width: '100%', margin: '0 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontWeight: 800 }}>{t('dashboard.invoiceTitle', 'Factura')}</h3>
              <button type="button" onClick={() => setFactura(null)} style={{ background: 'transparent', border: 0, fontSize: '1.4rem', cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>
            
            <div style={{ border: '1px dashed #d1d5db', padding: '20px', borderRadius: '12px', display: 'grid', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>{t('dashboard.invoiceNumber', 'Nº Factura')}</span>
                <strong>{factura.numeroFactura || `FAC-${factura.id}`}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>{t('dashboard.date', 'Fecha')}</span>
                <span>{formatearFecha(factura.fechaEmision)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>{t('dashboard.order', 'Pedido')}</span>
                <span>#{factura.pedidoId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>{t('catalogo.subtotal', 'Subtotal')}</span>
                <span>{formatearPrecio(factura.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>{t('dashboard.tax', 'IVA (19%)')}</span>
                <span>{formatearPrecio(factura.impuesto)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #2d6a4f', paddingTop: '10px', fontWeight: 800, fontSize: '1.1rem' }}>
                <span>{t('catalogo.total', 'Total')}</span>
                <span style={{ color: '#2d6a4f' }}>{formatearPrecio(factura.total)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setFactura(null)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                {t('general.cerrar', 'Cerrar')}
              </button>
              <button type="button" onClick={enviarFacturaCorreo} style={{ padding: '10px 20px', borderRadius: '10px', border: 0, background: '#2d6a4f', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                {t('pedidos.emailInvoiceBtn', '📧 Enviar por correo')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}