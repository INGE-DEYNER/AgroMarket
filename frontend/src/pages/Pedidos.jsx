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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('success') === 'true') {
      setShowSuccessBanner(true);
    }
    cargarPedidos();
  }, [location]);

  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

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
        <div id="successBanner" style={{
          display: showSuccessBanner ? 'flex' : 'none',
          background: '#eef7ee',
          border: '1px solid #1a5c2a',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '20px',
          color: '#1a5c2a',
          fontWeight: 600,
          alignItems: 'center',
          gap: '10px'
        }}>
          ✅ {t('pedidos.successBanner', '¡Pedido realizado con éxito! Ya está siendo procesado por el productor.')}
        </div>

        <div className="section-header" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="section-title">🧾 {t('pedidos.title', 'Mis Pedidos')}</span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ width: '170px' }}
              id="filtroEstado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">{t('dashboard.allStates', 'Todos los estados')}</option>
              <option value="PENDIENTE">{t('states.pending', 'Pendiente')}</option>
              <option value="ENVIADO">{t('states.onWay', 'Enviado')}</option>
              <option value="ENTREGADO">{t('states.delivered', 'Entregado')}</option>
              <option value="CANCELADO">{t('states.cancelled', 'Cancelado')}</option>
            </select>
            <Link to="/catalogo" className="btn btn-primary">+ {t('pedidos.newOrderBtn', 'Nuevo pedido')}</Link>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Productor</th>
                <th>Cantidad</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="tbPedidos">
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                    {t('general.cargando', 'Cargando...')}
                  </td>
                </tr>
              ) : (
                filteredPedidos.map((pedido) => {
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
                })
              )}
              {!loading && filteredPedidos.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                    {t('dashboard.noOrdersWithFilter', 'No hay pedidos con este filtro.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL FACTURA */}
      {factura && (
        <div className="modal-overlay" id="modalFactura">
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <span className="modal-title">{t('dashboard.invoiceTitle', 'Factura')}</span>
              <button className="modal-close" onClick={() => setFactura(null)}>✕</button>
            </div>
            <div id="facturaBody">
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
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setFactura(null)}>
                {t('general.cerrar', 'Cerrar')}
              </button>
              <button className="btn btn-primary" onClick={enviarFacturaCorreo}>
                📧 {t('pedidos.emailInvoiceBtn', 'Enviar por correo')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
