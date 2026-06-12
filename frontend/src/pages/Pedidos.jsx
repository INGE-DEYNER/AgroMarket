import { useState, useEffect } from 'react';
import useStyles from '../hooks/useStyles';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Pedidos() {
  useStyles(["/css/styles.css"]);
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modalFactura, setModalFactura] = useState(false);
  const [facturaData, setFacturaData] = useState(null);
  const [successBanner, setSuccessBanner] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === '1') setSuccessBanner(true);
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    try {
      const data = await api.get('/pedidos/mis-pedidos');
      setPedidos(Array.isArray(data) ? data : data.content || []);
    } catch {
      setPedidos([
        { id: '001', producto: '🍌 Banano Urabá Exportación', productor: 'Luis Palacios', cantidad: 70, total: 84000, estado: 'Pendiente' },
        { id: '002', producto: '🥭 Mango Tommy Premium', productor: 'Luis Palacios', cantidad: 40, total: 140000, estado: 'Enviado' },
        { id: '003', producto: '🍍 Piña Manzana', productor: 'Ana Córdoba', cantidad: 30, total: 84000, estado: 'Entregado' },
      ]);
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
      <nav className="navbar">
        <Link className="navbar-brand" to="/dashboard-comprador">
          <span className="logo-icon">🌿</span><span>AgroMarket</span>
        </Link>
        <div className="navbar-links" id="navLinks">
          <Link to="/dashboard-comprador">Mi Panel</Link>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/pedidos" className="active">Pedidos</Link>
          <Link to="/mensajeria">Mensajes</Link>
          <Link to="/envios">Envíos</Link>
        </div>
        <div className="navbar-right" id="navActions">
          <div className="avatar avatar-blue">MT</div>
          <Link to="/login" className="btn btn-secondary btn-sm">Salir</Link>
        </div>
      </nav>

      <main style={{ padding: '28px 32px', maxWidth: '1280px', margin: '0 auto' }}>
        {/* SUCCESS BANNER */}
        {successBanner && (
          <div id="successBanner" style={{ background: 'var(--green-bg)', border: '1px solid #1f4d2a', borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: '20px', color: 'var(--green-light)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
            ✅ ¡Pedido realizado con éxito! Ya está siendo procesado por el productor.
          </div>
        )}

        <div className="section-header">
          <span className="section-title">🧾 Mis Pedidos</span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ width: '170px' }}
              id="filtroEstado"
              value={filtroEstado}
              onChange={(e) => { setFiltroEstado(e.target.value); filtrar(); }}
            >
              <option value="">Todos los estados</option>
              <option>Pendiente</option>
              <option>Enviado</option>
              <option>Entregado</option>
              <option>Cancelado</option>
            </select>
            <Link to="/catalogo" className="btn btn-primary">+ Nuevo pedido</Link>
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
              {pedidosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td data-label="ID">#{p.id}</td>
                  <td data-label="Producto">{p.producto || p.nombreProducto || '—'}</td>
                  <td data-label="Productor">{p.productor || p.nombreProductor || '—'}</td>
                  <td data-label="Cantidad">{p.cantidad} kg</td>
                  <td data-label="Total">${Number(p.total).toLocaleString('es-CO')}</td>
                  <td data-label="Estado"><span className={badgeClass(p.estado)}>{p.estado}</span></td>
                  <td data-label="Acciones">
                    <button className="btn btn-secondary btn-sm" onClick={() => openFactura(p)}>📄 Factura</button>
                    <Link to="/envios" className="btn btn-secondary btn-sm" style={{ marginLeft: '6px' }}>🚚 Rastrear</Link>
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
              <span className="modal-title">Factura de Pedido</span>
              <button className="modal-close" onClick={closeFactura}>✕</button>
            </div>
            <div id="facturaBody" style={{ padding: '24px' }}>
              {facturaData && (
                <>
                  <p><strong>Pedido #:</strong> {facturaData.id}</p>
                  <p><strong>Producto:</strong> {facturaData.producto || facturaData.nombreProducto}</p>
                  <p><strong>Productor:</strong> {facturaData.productor || facturaData.nombreProductor}</p>
                  <p><strong>Cantidad:</strong> {facturaData.cantidad} kg</p>
                  <p><strong>Total:</strong> ${Number(facturaData.total).toLocaleString('es-CO')}</p>
                  <p><strong>Estado:</strong> {facturaData.estado}</p>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeFactura}>Cerrar</button>
              <button className="btn btn-primary" onClick={() => alert('Factura enviada al correo registrado exitosamente.')}>📧 Enviar por correo</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
