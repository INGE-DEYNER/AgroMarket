import { useState, useEffect } from 'react';
import useStyles from '../hooks/useStyles';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

export default function Envios() {
  useStyles(["/css/styles.css","/css/envios.css"]);
  const [shipments, setShipments] = useState([]);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get('/envios');
        const list = Array.isArray(data) ? data : data.content || [];
        setShipments(list.filter(e => e.estado !== 'Entregado'));
        setHistorial(list);
      } catch {
        const demo = [
          { id: 'ENV-001', producto: '🍌 Banano Urabá 50 kg', origen: 'Chigorodó', destino: 'Medellín', transportista: 'Servientrega', estado: 'En tránsito', fecha: '2026-06-10', progreso: 65 },
          { id: 'ENV-002', producto: '🥭 Mango Tommy 40 kg', origen: 'Apartadó', destino: 'Bogotá', transportista: 'TCC', estado: 'Entregado', fecha: '2026-06-08', progreso: 100 },
        ];
        setShipments(demo.filter(e => e.estado !== 'Entregado'));
        setHistorial(demo);
      }
    })();
  }, []);

  const progressColor = (estado) => {
    if (estado === 'Entregado') return 'var(--primary)';
    if (estado === 'En tránsito') return 'var(--blue)';
    return 'var(--gold)';
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
          <Link to="/pedidos">Pedidos</Link>
          <Link to="/mensajeria">Mensajes</Link>
          <Link to="/envios" className="active">Envíos</Link>
        </div>
        <div className="navbar-right" id="navActions">
          <div className="avatar avatar-blue">MT</div>
          <Link to="/login" className="btn btn-secondary btn-sm">Salir</Link>
        </div>
      </nav>

      <main style={{ padding: '28px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="section-header" style={{ marginBottom: '24px' }}>
          <span className="section-title">🚚 Seguimiento de Envíos</span>
        </div>

        {/* ACTIVE SHIPMENTS */}
        <div id="shipmentsContainer">
          {shipments.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>
              <div className="empty-icon">📦</div>
              <div>No hay envíos activos en este momento.</div>
            </div>
          ) : (
            shipments.map((s) => (
              <div key={s.id} className="shipment-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: '24px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>{s.producto}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      📍 {s.origen} → {s.destino} · {s.transportista}
                    </div>
                  </div>
                  <span className="badge-status status-shipped">{s.estado}</span>
                </div>
                <div style={{ background: 'var(--border-light)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.progreso || 0}%`, background: progressColor(s.estado), borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>{s.progreso || 0}% completado</div>
              </div>
            ))
          )}
        </div>

        {/* HISTORY TABLE */}
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.05rem', marginBottom: '16px' }}>
            📋 Historial de todos los envíos
          </h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID Envío</th>
                  <th>Producto</th>
                  <th>Origen → Destino</th>
                  <th>Transportista</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody id="tbHistorial">
                {historial.map((e) => (
                  <tr key={e.id}>
                    <td data-label="ID Envío">{e.id}</td>
                    <td data-label="Producto">{e.producto}</td>
                    <td data-label="Origen → Destino">{e.origen} → {e.destino}</td>
                    <td data-label="Transportista">{e.transportista}</td>
                    <td data-label="Estado"><span className={`badge-status ${e.estado === 'Entregado' ? 'status-shipped' : 'status-pending'}`}>{e.estado}</span></td>
                    <td data-label="Fecha">{e.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
