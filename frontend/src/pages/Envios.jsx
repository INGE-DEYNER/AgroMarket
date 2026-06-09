// File: frontend/src/pages/Envios.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatearFecha, showToast } from '../utils/ui.js';
import Navbar from '../components/Navbar.jsx';
import '../../css/envios.css'; // Import page styles

export default function Envios() {
  const { t } = useTranslation();
  const { user } = useAuth();
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
      showToast(error?.message || t('envios.loadError', 'No se pudieron cargar los envíos.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const labelEstado = (estado) => {
    const value = String(estado || '').toUpperCase();
    const mapa = {
      PENDIENTE: t('states.pending', 'Pendiente'),
      CONFIRMADO: t('states.confirmed', 'Confirmado'),
      PREPARANDO: t('states.preparing', 'Preparando'),
      EN_CAMINO: t('states.onWay', 'En camino'),
      ENTREGADO: t('states.delivered', 'Entregado'),
      CANCELADO: t('states.cancelled', 'Cancelado'),
    };
    return mapa[value] || estado;
  };

  const pasoActual = (estado) => {
    const value = String(estado || '').toUpperCase();
    const mapa = {
      PENDIENTE: 0,
      CONFIRMADO: 1,
      PREPARANDO: 2,
      EN_CAMINO: 3,
      ENTREGADO: 4,
      CANCELADO: 0,
    };
    return mapa[value] ?? 0;
  };

  const badgeClaseEnvio = (estado) => {
    const value = String(estado || '').toUpperCase();
    if (value === 'ENTREGADO') return 'badge-gray';
    if (value === 'EN_CAMINO') return 'badge-yellow';
    if (value === 'PREPARANDO') return 'badge-blue';
    return 'badge-green';
  };

  const steps = [
    t('envios.step1', 'Pedido recibido'),
    t('envios.step2', 'Pago confirmado'),
    t('envios.step3', 'Preparando envío'),
    t('envios.step4', 'En camino'),
    t('envios.step5', 'Entregado'),
  ];

  return (
    <>
      <Navbar />
      <main style={{ padding: '28px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="section-header" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a3a2a', margin: 0 }}>
            🚚 {t('envios.title', 'Seguimiento de Envíos')}
          </h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            {t('general.cargando', 'Cargando...')}
          </div>
        ) : (
          <>
            {/* Active Shipments */}
            <div id="shipmentsContainer">
              {envios.map((envio) => {
                const actual = pasoActual(envio.estado);
                return (
                  <div key={envio.id} className="shipment-card">
                    <div className="shipment-header">
                      <div>
                        <div className="shipment-id">
                          ENV-{envio.id} · {t('dashboard.orderHeader', 'Pedido')} #{envio.pedidoId} · {t('envios.guide', 'Guía')}: {envio.guia || '-'}
                        </div>
                        <div className="shipment-route" style={{ color: '#2d7a3a' }}>
                          {envio.origen} → {envio.direccionDestino}
                        </div>
                        <div className="shipment-meta">
                          <span>
                            🚛 <strong>{envio.transportista || t('envios.unassignedCarrier', 'Por asignar')}</strong>
                          </span>
                        </div>
                      </div>
                      <span className={`badge ${badgeClaseEnvio(envio.estado)}`}>
                        {labelEstado(envio.estado)}
                      </span>
                    </div>

                    <div className="tracking-bar">
                      {steps.map((stepLabel, index) => {
                        const isDone = index < actual;
                        const isCurrent = index === actual;
                        const stepClass = isDone ? 'done' : (isCurrent ? 'current' : 'pending');
                        return (
                          <div key={index} className="track-step">
                            <div className={`track-circle ${stepClass}`}>
                              {isDone ? '✓' : index + 1}
                            </div>
                            <div className="track-label">{stepLabel}</div>
                            <div className={`track-line ${isDone ? 'done' : ''}`} />
                          </div>
                        );
                      })}
                    </div>

                    <div className="last-update">
                      📅 {t('envios.estimatedDelivery', 'Entrega estimada')}: <strong>{formatearFecha(envio.fechaEstimadaEntrega)}</strong>
                    </div>

                    <div className="shipment-actions">
                      <Link to="/mensajeria" className="btn btn-secondary btn-sm">
                        💬 {t('envios.contactBtn', 'Contactar')}
                      </Link>
                      <Link to="/pedidos" className="btn btn-ghost btn-sm" style={{ border: '1px solid transparent', color: '#6b7280', fontWeight: 600 }}>
                        🧾 {t('envios.viewOrderBtn', 'Ver pedido')}
                      </Link>
                    </div>
                  </div>
                );
              })}

              {envios.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px', background: '#fff', borderRadius: '16px', border: '1px solid rgba(45,106,79,.12)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🚚</div>
                  <div style={{ color: '#6b7280' }}>{t('envios.noShipments', 'No tienes envíos registrados.')}</div>
                </div>
              )}
            </div>

            {/* History Table */}
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', color: '#1a3a2a' }}>
                📋 {t('envios.historyTitle', 'Historial de todos los envíos')}
              </h3>
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(45,106,79,.12)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8faf8' }}>
                      {[t('envios.idHeader', 'ID Envío'), t('dashboard.orderHeader', 'Pedido'), t('envios.routeHeader', 'Origen → Destino'), t('envios.carrierHeader', 'Transportista'), t('dashboard.statusHeader', 'Estado'), t('dashboard.date', 'Fecha')].map((h) => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {envios.map((envio) => (
                      <tr key={envio.id} style={{ borderTop: '1px solid rgba(45,106,79,.08)' }}>
                        <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '.82rem' }}>ENV-{envio.id}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>#{envio.pedidoId}</td>
                        <td style={{ padding: '12px 16px', fontSize: '.82rem' }}>{envio.origen} → {envio.direccionDestino}</td>
                        <td style={{ padding: '12px 16px' }}>{envio.transportista || '-'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`badge ${badgeClaseEnvio(envio.estado)}`} style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {labelEstado(envio.estado)}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '.82rem' }}>{formatearFecha(envio.fechaEstimadaEntrega)}</td>
                      </tr>
                    ))}
                    {envios.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                          {t('envios.noHistory', 'Sin historial de envíos.')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}