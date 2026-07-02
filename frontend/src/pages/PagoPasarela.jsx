import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../hooks/useCart';
import '../styles/login.css'; // Reuses base auth form/panel wrappers for clean style

export default function PagoPasarela() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const [pagoId, setPagoId] = useState(null);
  const [referencia, setReferencia] = useState('');
  const [monto, setMonto] = useState(0);
  const [metodo, setMetodo] = useState('PSE'); // PSE or TARJETA_CREDITO
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('pending'); // pending, processing, success, error
  const [selectedBank, setSelectedBank] = useState('Bancolombia');
  
  // PSE fields
  const [tipoPersona, setTipoPersona] = useState('Natural');
  const [tipoCuenta, setTipoCuenta] = useState('Ahorros');
  const [numeroCuenta, setNumeroCuenta] = useState('');

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardError, setCardError] = useState('');

  // Generated receipt details
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get('pagoId');
    const ref = params.get('referencia');
    const amt = params.get('monto');
    const met = params.get('metodo');
    
    setPagoId(pid);
    setReferencia(ref || '');
    setMonto(amt ? Number(amt) : 45000);
    if (met === 'TARJETA_CREDITO' || met === 'TARJETA_DEBITO') {
      setMetodo('TARJETA');
    } else {
      setMetodo('PSE');
    }
  }, [location.search]);

  // Luhn Algorithm Validation
  const validateLuhn = (number) => {
    let sum = 0;
    let shouldDouble = false;
    const clean = number.replace(/\s+/g, '');
    if (!/^\d+$/.test(clean)) return false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let digit = parseInt(clean.charAt(i), 10);
      if (shouldDouble) {
        if ((digit *= 2) > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
    setCardNumber(formatted);
  };

  const handleExpChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setCardExp(value.substring(0, 5));
  };

  const handleConfirm = async (approved) => {
    if (!pagoId) return;

    if (approved && metodo === 'TARJETA') {
      setCardError('');
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (cleanCard.length < 13 || cleanCard.length > 19) {
        setCardError('Número de tarjeta inválido.');
        return;
      }
      if (!validateLuhn(cleanCard)) {
        setCardError('La tarjeta no supera el algoritmo de validación Luhn.');
        return;
      }
      if (!cardName.trim()) {
        setCardError('Nombre del titular requerido.');
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExp)) {
        setCardError('Formato de fecha inválido (MM/YY).');
        return;
      }
      if (cardCvv.length < 3) {
        setCardError('Código CVV inválido.');
        return;
      }
    }

    if (approved && metodo === 'PSE') {
      if (!numeroCuenta || numeroCuenta.length < 8) {
        alert('Por favor ingrese un número de cuenta válido.');
        return;
      }
    }

    setLoading(true);
    setStatus('processing');

    // Simulate 2.5 seconds processing
    setTimeout(async () => {
      try {
        await api.post('/pagos/confirmar', {
          pagoId: Number(pagoId),
          referencia: referencia,
          estado: approved ? 'APROBADO' : 'RECHAZADO'
        });

        if (approved) {
          const txnId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
          setReceipt({
            txnId,
            fecha: new Date().toLocaleString('es-CO'),
            monto: monto,
            referencia: referencia
          });
          setStatus('success');
          clearCart();
        } else {
          setStatus('error');
        }
      } catch (err) {
        alert('Error al confirmar transacción: ' + err.message);
        setStatus('error');
      } finally {
        setLoading(false);
      }
    }, 2500);
  };

  return (
    <div className="wrapper" style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '520px', width: '100%', padding: '32px', background: '#fff', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
        
        {/* BRAND */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', justifyContent: 'center' }}>
          <span style={{ fontSize: '2rem' }}>🌿</span>
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2d6a4f', fontFamily: 'Outfit, sans-serif' }}>AgroMarket Pasarela</span>
        </div>

        {/* STATUS: PROCESSING */}
        {status === 'processing' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="payment-spinner" style={{ width: '50px', height: '50px', border: '5px solid #e2e8f0', borderTop: '5px solid #2d6a4f', borderRadius: '50%', animation: 'chat-pulse 1s infinite linear', margin: '0 auto 20px auto' }}></div>
            <style>{`
              @keyframes chat-pulse {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Procesando tu pago...</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Estamos validando los datos con tu entidad financiera.</p>
          </div>
        )}

        {/* STATUS: PENDING INPUT */}
        {status === 'pending' && (
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', textAlign: 'center', marginBottom: '8px', color: '#1e293b' }}>
              Simulador de Pago Seguro
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', marginBottom: '24px' }}>
              Estás en el portal demo de AgroMarket. Selecciona y simula tu pago de forma segura.
            </p>

            {/* ORDER SUMMARY */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Referencia:</span>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>{referencia || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Monto a Pagar:</span>
                <span style={{ fontWeight: '800', color: '#2d6a4f', fontSize: '1.1rem' }}>${monto.toLocaleString('es-CO')} COP</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Concepto:</span>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>Compra AgroMarket - ASAFRUT</span>
              </div>
            </div>

            {/* PAYMENT METHOD SWITCH */}
            <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', marginBottom: '20px' }}>
              <button 
                onClick={() => setMetodo('PSE')} 
                style={{ flex: 1, padding: '10px', border: 'none', background: metodo === 'PSE' ? '#fff' : 'transparent', borderRadius: '6px', fontWeight: '600', fontSize: '0.85rem', color: metodo === 'PSE' ? '#2d6a4f' : '#64748b', boxShadow: metodo === 'PSE' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer' }}
              >
                PSE Débito
              </button>
              <button 
                onClick={() => setMetodo('TARJETA')} 
                style={{ flex: 1, padding: '10px', border: 'none', background: metodo === 'TARJETA' ? '#fff' : 'transparent', borderRadius: '6px', fontWeight: '600', fontSize: '0.85rem', color: metodo === 'TARJETA' ? '#2d6a4f' : '#64748b', boxShadow: metodo === 'TARJETA' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer' }}
              >
                Tarjeta Crédito/Débito
              </button>
            </div>

            {/* PSE FORM */}
            {metodo === 'PSE' && (
              <div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Banco</label>
                  <select 
                    className="form-select" 
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                  >
                    <option value="Bancolombia">Bancolombia</option>
                    <option value="Banco de Bogota">Banco de Bogotá</option>
                    <option value="Davivienda">Davivienda</option>
                    <option value="BBVA">BBVA Colombia</option>
                    <option value="Nequi">Nequi</option>
                    <option value="Daviplata">Daviplata</option>
                    <option value="Lulo Bank">Lulo Bank</option>
                    <option value="Banco Popular">Banco Popular</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tipo de Persona</label>
                    <select className="form-select" value={tipoPersona} onChange={(e) => setTipoPersona(e.target.value)}>
                      <option value="Natural">Persona Natural</option>
                      <option value="Juridica">Persona Jurídica</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tipo de Cuenta</label>
                    <select className="form-select" value={tipoCuenta} onChange={(e) => setTipoCuenta(e.target.value)}>
                      <option value="Ahorros">Cuenta Ahorros</option>
                      <option value="Corriente">Cuenta Corriente</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Número de Cuenta / Celular</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    placeholder="Ej. 1014589632"
                    value={numeroCuenta}
                    onChange={(e) => setNumeroCuenta(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
            )}

            {/* CARD FORM */}
            {metodo === 'TARJETA' && (
              <div>
                <div style={{ background: '#f0fdf4', border: '1px dashed #b7e4c7', padding: '10px 14px', borderRadius: '8px', color: '#2d6a4f', fontSize: '0.8rem', marginBottom: '16px', fontWeight: '500' }}>
                  💳 Modo de prueba: Usa <b>4111 1111 1111 1111</b> para aprobar automáticamente.
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Número de Tarjeta</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Nombre del Titular</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    placeholder="Nombre Completo"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Vencimiento</label>
                    <input 
                      className="form-input" 
                      type="text" 
                      placeholder="MM/YY"
                      value={cardExp}
                      onChange={handleExpChange}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">CVV</label>
                    <input 
                      className="form-input" 
                      type="password" 
                      placeholder="123"
                      maxLength="4"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>

                {cardError && (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '14px', fontWeight: '500' }}>
                    ⚠️ {cardError}
                  </div>
                )}
              </div>
            )}

            {/* BUTTONS */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '14px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
                onClick={() => handleConfirm(false)}
                disabled={loading}
              >
                Rechazar
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 2, padding: '14px', background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 12px rgba(45,106,79,0.15)' }}
                onClick={() => handleConfirm(true)}
                disabled={loading}
              >
                Autorizar Pago
              </button>
            </div>
          </div>
        )}

        {/* STATUS: SUCCESS RECEIPT */}
        {status === 'success' && receipt && (
          <div style={{ animation: 'scaleIn 0.3s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px auto', boxShadow: '0 4px 10px rgba(16,185,129,0.1)' }}>✓</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1e293b' }}>Pago Procesado Exitosamente</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Conserva tu recibo de transacción digital.</p>
            </div>

            {/* TICKET RECEIPT */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', background: '#fafafa', padding: '20px', marginBottom: '24px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #cbd5e1', paddingBottom: '12px', marginBottom: '12px', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b' }}>Estado:</span>
                <span style={{ fontWeight: '700', color: '#10b981' }}>APROBADO (Demo)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b' }}>Transacción ID:</span>
                <span style={{ fontWeight: '600', color: '#1e293b', fontFamily: 'monospace' }}>{receipt.txnId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b' }}>Pedido Ref:</span>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>{receipt.referencia}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b' }}>Monto Debitado:</span>
                <span style={{ fontWeight: '800', color: '#2d6a4f' }}>${receipt.monto.toLocaleString('es-CO')} COP</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b' }}>Fecha y Hora:</span>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>{receipt.fecha}</span>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px', background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
              onClick={() => navigate('/dashboard-comprador?section=misPedidos&success=1')}
            >
              Volver a AgroMarket
            </button>
          </div>
        )}

        {/* STATUS: ERROR */}
        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '24px 0', animation: 'scaleIn 0.3s ease-out' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px auto' }}>✗</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>Transacción Cancelada</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '24px' }}>La operación fue rechazada por el banco o usuario.</p>
            
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px', background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
              onClick={() => navigate('/dashboard-comprador?section=misPedidos&error=1')}
            >
              Volver a AgroMarket
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
