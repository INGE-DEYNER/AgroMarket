import React from 'react';

export default function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(135deg, #1B5E20, #2E7D32, #43A047)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '24px'
    }}>
      {/* Logo animado */}
      <div style={{ animation: 'pulse 1.5s infinite' }}>
        <svg viewBox="0 0 24 24" width="80" height="80" fill="white">
          <path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z"/>
        </svg>
      </div>
      <div style={{ color: 'white', fontSize: '28px', fontWeight: '700', letterSpacing: '2px' }}>
        AgroMarket
      </div>
      {/* Dots animados */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: '12px', height: '12px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.8)',
            animation: `bounce 1.2s ${i * 0.2}s infinite`
          }} />
        ))}
      </div>
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
      `}</style>
    </div>
  );
}
