import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/login.css'; // Reuses base auth form/panel wrappers for clean style

export default function PagoPasarela() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pagoId, setPagoId] = useState(null);
  const [referencia, setReferencia] = useState('');
  const [monto, setMonto] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('pending'); // pending, success, error
  const [selectedBank, setSelectedBank] = useState('Bancolombia');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get('pagoId');
    const ref = params.get('referencia');
    setPagoId(pid);
    setReferencia(ref || '');

    // Fetch payment/order details if possible
    if (pid) {
      (async () => {
        try {
          // Temporarily mock amount or fetch from backend if possible
          setMonto(45000); // fallback
        } catch {}
      })();
    }
  }, [location.search]);

  const handleConfirm = async (approved) => {
    if (!pagoId) return;
    setLoading(true);
    try {
      await api.post('/pagos/confirmar', {
        pagoId: Number(pagoId),
        referencia: referencia,
        estado: approved ? 'APROBADO' : 'RECHAZADO'
      });
      setStatus(approved ? 'success' : 'error');
      setTimeout(() => {
        if (approved) {
          navigate('/dashboard-comprador?section=misPedidos&success=1');
        } else {
          navigate('/dashboard-comprador?section=misPedidos&error=1');
        }
      }, 2000);
    } catch (err) {
      alert('Error al procesar la confirmación: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="wrapper" style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '500px', width: '100%', padding: '32px', background: '#fff', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid #eaeaea' }}>
        
        {/* BRAND */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', justifyContent: 'center' }}>
          <span style={{ fontSize: '1.8rem' }}>🌿</span>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)', fontFamily: 'var(--font-title)' }}>AgroMarket Pasarela PSE</span>
        </div>

        {status === 'pending' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', textAlign: 'center', marginBottom: '8px' }}>Simulador de Pago Seguro PSE</h2>
            <p style={{ fontSize: '0.85rem', color: '#666', textAlign: 'center', marginBottom: '24px' }}>
              Estás en el portal de simulación de pagos de ASAFRUT. Autoriza o rechaza esta transacción.
            </p>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Referencia:</span>
                <span style={{ fontWeight: '600' }}>{referencia || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Pago ID:</span>
                <span style={{ fontWeight: '600' }}>#{pagoId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Concepto:</span>
                <span style={{ fontWeight: '600' }}>Compra en AgroMarket</span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Selecciona tu Entidad Bancaria</label>
              <select 
                className="form-select" 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
              >
                <option value="Bancolombia">Bancolombia</option>
                <option value="Banco de Bogota">Banco de Bogotá</option>
                <option value="Davivienda">Davivienda</option>
                <option value="Nequi">Nequi</option>
                <option value="Daviplata">Daviplata</option>
                <option value="Lulo Bank">Lulo Bank</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                onClick={() => handleConfirm(false)}
                disabled={loading}
              >
                Rechazar Pago
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 2, padding: '14px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                onClick={() => handleConfirm(true)}
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Autorizar Pago'}
              </button>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '3.5rem', color: '#22c55e', marginBottom: '16px' }}>✓</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>¡Pago Autorizado!</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Redirigiendo de vuelta a AgroMarket...</p>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '3.5rem', color: '#ef4444', marginBottom: '16px' }}>✗</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Transacción Cancelada</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>El pago fue rechazado. Redirigiendo...</p>
          </div>
        )}

      </div>
    </div>
  );
}
