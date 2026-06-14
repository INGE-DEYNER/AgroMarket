import { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useSecureParams } from '../utils/useSecureParams';
import api from '../utils/api';

export default function Pedidos() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params] = useSecureParams();

  if (user) {
    const role = user.role?.toLowerCase();
    if (role === 'comprador') {
      return <Navigate to="/dashboard-comprador?section=misPedidos" replace />;
    } else if (role === 'productor') {
      return <Navigate to="/dashboard-productor?section=pedidosRec" replace />;
    } else if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
  }

  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modalFactura, setModalFactura] = useState(false);
  const [facturaData, setFacturaData] = useState(null);
  const [successBanner, setSuccessBanner] = useState(false);

  useEffect(() => {
    if (params.success === '1') setSuccessBanner(true);
    loadPedidos();
  }, [params]);

  const loadPedidos = async () => {
    try {
      const data = await api.get('/pedidos/mis-pedidos');
      setPedidos(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error('Error loadPedidos:', err);
      setPedidos([]);
    }
  };

  const filtrar = () => {};

  const pedidosFiltrados = filtroEstado
    ? pedidos.filter((p) => p.estado?.toLowerCase() === filtroEstado.toLowerCase())
    : pedidos;

  const openFactura = (pedido) => { setFacturaData(pedido); setModalFactura(true); };
  const closeFactura = () => setModalFactura(false);

  const badgeClass = (estado) => {
    const e = estado?.toLowerCase();
    if (e === 'pendiente') return 'badge-status status-pending';
    if (e === 'enviado') return 'badge-status status-shipped';
    if (e === 'entregado') return 'badge-status status-delivered';
    if (e === 'cancelado') return 'badge-status status-cancelled';
    return 'badge-status';
  };

  return (
    <>
      <Navbar />

      <main style={{ padding: '28px 32px', maxWidth: '1280px', margin: '0 auto' }}>
        {/* SUCCESS BANNER */}
        {successBanner && (
          <div id="successBanner" style={{ background: 'var(--green-bg)', border: '1px solid #1f4d2a', borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: '20px', color: 'var(--green-light)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {t('pedidos.successMessage', '¡Pedido realizado con éxito! Ya está siendo procesado por el productor.')}
          </div>
        )}

        <div className="section-header">
          <span className="section-title"> {t('pedidos.title', 'Mis Pedidos')}</span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ width: '170px' }}
              id="filtroEstado"
              value={filtroEstado}
              onChange={(e) => { setFiltroEstado(e.target.value); filtrar(); }}
            >
              <option value="">{t('pedidos.allStates', 'Todos los estados')}</option>
              <option value="Pendiente">{t('pedidos.status.pendiente', 'Pendiente')}</option>
              <option value="Enviado">{t('pedidos.status.enviado', 'Enviado')}</option>
              <option value="Entregado">{t('pedidos.status.entregado', 'Entregado')}</option>
              <option value="Cancelado">{t('pedidos.status.cancelado', 'Cancelado')}</option>
            </select>
            <Link to="/catalogo" className="btn btn-primary">{t('pedidos.newOrder', '+ Nuevo pedido')}</Link>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('pedidos.id', 'ID')}</th>
                <th>{t('pedidos.product', 'Producto')}</th>
                <th>{t('pedidos.producer', 'Productor')}</th>
                <th>{t('pedidos.quantity', 'Cantidad')}</th>
                <th>{t('pedidos.total', 'Total')}</th>
                <th>{t('pedidos.statusHeader', 'Estado')}</th>
                <th>{t('pedidos.actions', 'Acciones')}</th>
              </tr>
            </thead>
            <tbody id="tbPedidos">
              {pedidosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td data-label={t('pedidos.id', 'ID')}>#{p.id}</td>
                  <td data-label={t('pedidos.product', 'Producto')}>{p.producto || p.nombreProducto || '—'}</td>
                  <td data-label={t('pedidos.producer', 'Productor')}>{p.productor || p.nombreProductor || '—'}</td>
                  <td data-label={t('pedidos.quantity', 'Cantidad')}>{p.cantidad} kg</td>
                  <td data-label={t('pedidos.total', 'Total')}>${Number(p.total).toLocaleString('es-CO')}</td>
                  <td data-label={t('pedidos.statusHeader', 'Estado')}><span className={badgeClass(p.estado)}>{t('pedidos.status.' + p.estado?.toLowerCase(), p.estado)}</span></td>
                  <td data-label={t('pedidos.actions', 'Acciones')}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openFactura(p)}>{t('pedidos.invoice', 'Factura')}</button>
                    <Link to="/envios" className="btn btn-secondary btn-sm" style={{ marginLeft: '6px' }}>{t('pedidos.track', 'Rastrear')}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL FACTURA */}
      {modalFactura && (
        <div className="modal-overlay open" id="modalFactura">
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <span className="modal-title">{t('pedidos.invoiceTitle', 'Factura de Pedido')}</span>
              <button className="modal-close" onClick={closeFactura}>✕</button>
            </div>
            <div id="facturaBody" style={{ padding: '24px' }}>
              {facturaData && (
                <>
                  <p><strong>{t('pedidos.invoiceDetail.id', 'Pedido #:')}</strong> {facturaData.id}</p>
                  <p><strong>{t('pedidos.invoiceDetail.product', 'Producto:')}</strong> {facturaData.producto || facturaData.nombreProducto}</p>
                  <p><strong>{t('pedidos.invoiceDetail.producer', 'Productor:')}</strong> {facturaData.productor || facturaData.nombreProductor}</p>
                  <p><strong>{t('pedidos.invoiceDetail.quantity', 'Cantidad:')}</strong> {facturaData.cantidad} kg</p>
                  <p><strong>{t('pedidos.invoiceDetail.total', 'Total:')}</strong> ${Number(facturaData.total).toLocaleString('es-CO')}</p>
                  <p><strong>{t('pedidos.invoiceDetail.status', 'Estado:')}</strong> {t('pedidos.status.' + facturaData.estado?.toLowerCase(), facturaData.estado)}</p>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeFactura}>{t('pedidos.close', 'Cerrar')}</button>
              <button className="btn btn-primary" onClick={() => alert(t('pedidos.invoiceSent', 'Factura enviada al correo registrado exitosamente.'))}>{t('pedidos.sendEmail', 'Enviar por correo')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
