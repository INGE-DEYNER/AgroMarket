import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import { formatearFecha } from '../utils/ui.js';
import '../styles/styles.css';
import '../styles/envios.css';

export default function Envios() {
  const { user, logout } = useAuth();
  const [envios, setEnvios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEnvios();
  }, []);

  const cargarEnvios = async () => {
    setLoading(true);
    try {
      const data = await api.getMisEnvios();
      setEnvios(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  const labelEstado = (estado) => {
    const value = String(estado || '').toUpperCase();
    const mapa = {
      PENDIENTE: 'Pendiente',
      CONFIRMADO: 'Confirmado',
      PREPARANDO: 'Preparando',
      EN_CAMINO: 'En camino',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
    };
    return mapa[value] || estado;
  };

  const badgeClaseEnvio = (estado) => {
    const value = String(estado || '').toUpperCase();
    if (value === 'ENTREGADO') return 'badge-gray';
    if (value === 'EN_CAMINO') return 'badge-yellow';
    if (value === 'PREPARANDO') return 'badge-blue';
    return 'badge-green';
  };

  return (
    <>
      <nav className="navbar">
        <a className="navbar-brand" href="/dashboard-comprador">
          <span className="logo-icon">🌿</span>
          <span>AgroMarket</span>
        </a>
        <div className="navbar-links" id="navLinks">
          <Link to="/dashboard-comprador">Mi Panel</Link>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/pedidos">Pedidos</Link>
          <Link to="/mensajeria">Mensajes</Link>
          <Link to="/envios" className="active">Envíos</Link>
        </div>
        <div className="navbar-right" id="navActions">
          <div className="avatar avatar-blue">--</div>
          <a href="#" onClick={handleLogout} className="btn btn-secondary btn-sm">
            Cerrar sesión
          </a>
        </div>
      </nav>

      <main style={{ padding: '28px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="section-header" style={{ marginBottom: '24px' }}>
          <span className="section-title">🚚 Seguimiento de Envíos</span>
        </div>

        <div id="shipmentsContainer">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Cargando...</div>
          ) : envios.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: '#fff', borderRadius: '16px', border: '1px solid rgba(45,106,79,.12)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🚚</div>
              <div style={{ color: '#6b7280' }}>No tienes envíos registrados.</div>
            </div>
          ) : (
            envios.map((envio) => (
              <div key={envio.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(45,106,79,.12)', padding: '24px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                      ENV-{envio.id} · Pedido #{envio.pedidoId} · Guía: {envio.guia || '-'}
                    </div>
                    <div style={{ color: '#2d7a3a', marginBottom: '4px' }}>
                      {envio.origen} → {envio.direccionDestino}
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      🚛 <strong>{envio.transportista || 'Por asignar'}</strong>
                    </div>
                  </div>
                  <span className={badgeClaseEnvio(envio.estado)} style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {labelEstado(envio.estado)}
                  </span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  📅 Entrega estimada: <strong>{formatearFecha(envio.fechaEstimadaEntrega)}</strong>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link to="/mensajeria" className="btn btn-secondary btn-sm">
                    💬 Contactar
                  </Link>
                  <Link to="/pedidos" className="btn btn-ghost btn-sm" style={{ border: '1px solid transparent', color: '#6b7280', fontWeight: 600 }}>
                    🧾 Ver pedido
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

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
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                      Cargando...
                    </td>
                  </tr>
                ) : envios.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                      Sin historial de envíos.
                    </td>
                  </tr>
                ) : (
                  envios.map((envio) => (
                    <tr key={envio.id} style={{ borderTop: '1px solid rgba(45,106,79,.08)' }}>
                      <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '0.82rem' }}>ENV-{envio.id}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>#{envio.pedidoId}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.82rem' }}>{envio.origen} → {envio.direccionDestino}</td>
                      <td style={{ padding: '12px 16px' }}>{envio.transportista || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={badgeClaseEnvio(envio.estado)} style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                          {labelEstado(envio.estado)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '0.82rem' }}>{formatearFecha(envio.fechaEstimadaEntrega)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
