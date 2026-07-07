import { useState, useRef, useEffect } from 'react';
import { useDivisa } from '../context/DivisaContext';

const DIVISAS = [
    { codigo: 'COP', nombre: 'Peso colombiano', bandera: '🇨🇴', simbolo: '$' },
    { codigo: 'USD', nombre: 'Dólar estadounidense', bandera: '🇺🇸', simbolo: 'US$' },
    { codigo: 'EUR', nombre: 'Euro', bandera: '🇪🇺', simbolo: '€' },
    { codigo: 'GBP', nombre: 'Libra esterlina', bandera: '🇬🇧', simbolo: '£' },
    { codigo: 'BRL', nombre: 'Real brasileño', bandera: '🇧🇷', simbolo: 'R$' },
    { codigo: 'MXN', nombre: 'Peso mexicano', bandera: '🇲🇽', simbolo: 'MX$' },
    { codigo: 'CLP', nombre: 'Peso chileno', bandera: '🇨🇱', simbolo: 'CLP$' },
    { codigo: 'PEN', nombre: 'Sol peruano', bandera: '🇵🇪', simbolo: 'S/' },
    { codigo: 'ARS', nombre: 'Peso argentino', bandera: '🇦🇷', simbolo: 'AR$' },
    { codigo: 'CAD', nombre: 'Dólar canadiense', bandera: '🇨🇦', simbolo: 'CA$' },
    { codigo: 'JPY', nombre: 'Yen japonés', bandera: '🇯🇵', simbolo: '¥' },
    { codigo: 'CNY', nombre: 'Yuan chino', bandera: '🇨🇳', simbolo: '¥' },
];

export default function DivisaSwitcher() {
  const { divisaActual, cambiarDivisa } = useDivisa();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentDivisa = DIVISAS.find((d) => d.codigo === divisaActual) || DIVISAS[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectDivisa = (codigo) => {
    cambiarDivisa(codigo);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'transparent',
          color: 'var(--text-main, #333)',
          border: '1px solid var(--border-light, #e5e7eb)',
          borderRadius: '8px',
          padding: '6px 10px',
          fontSize: '0.85rem',
          cursor: 'pointer',
          fontWeight: '500',
          transition: 'all 0.2s',
          backgroundColor: '#fff',
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>{currentDivisa.bandera}</span>
        <span>{currentDivisa.codigo}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-light, #e5e7eb)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1000,
            minWidth: '180px',
            maxHeight: '280px',
            overflowY: 'auto',
          }}
        >
          {DIVISAS.map((divisa) => (
            <button
              key={divisa.codigo}
              onClick={() => selectDivisa(divisa.codigo)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 12px',
                background: divisaActual === divisa.codigo ? '#f3f4f6' : 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: divisaActual === divisa.codigo ? 'var(--primary, #2d6a4f)' : '#4b5563',
                fontWeight: divisaActual === divisa.codigo ? '600' : '400',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
              onMouseLeave={(e) => (e.currentTarget.style.background = divisaActual === divisa.codigo ? '#f3f4f6' : 'transparent')}
            >
              <span style={{ fontSize: '1.1rem' }}>{divisa.bandera}</span>
              <span style={{ fontWeight: 'bold', width: '35px' }}>{divisa.codigo}</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({divisa.simbolo}) {divisa.nombre}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
