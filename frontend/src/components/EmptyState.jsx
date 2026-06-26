// src/components/EmptyState.jsx

/**
 * Empty state with SVG tropical fruit illustration and float animation.
 * Props: title, description, ctaLabel, ctaHref, onCta (function)
 */
export default function EmptyState({
  title = 'Sin resultados',
  description = 'No encontramos nada por aquí.',
  ctaLabel = null,
  ctaHref = null,
  onCta = null,
  icon = 'produce', // 'produce' | 'box' | 'search'
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '64px 24px', gap: '20px', textAlign: 'center',
    }}>
      <div style={{ animation: 'emptyFloat 3s ease-in-out infinite' }}>
        {icon === 'produce' && <ProduceSvg />}
        {icon === 'box'     && <BoxSvg />}
        {icon === 'search'  && <SearchSvg />}
      </div>

      <div style={{ maxWidth: '320px' }}>
        <h3 style={{
          fontSize: '18px', fontWeight: '700',
          color: '#1b4332', marginBottom: '8px',
          fontFamily: "'Outfit', sans-serif",
        }}>
          {title}
        </h3>
        <p style={{ color: '#4a5568', fontSize: '14px', lineHeight: '1.6' }}>
          {description}
        </p>
      </div>

      {(ctaLabel && (ctaHref || onCta)) && (
        ctaHref ? (
          <a href={ctaHref} style={ctaStyle}>{ctaLabel}</a>
        ) : (
          <button onClick={onCta} style={ctaStyle}>{ctaLabel}</button>
        )
      )}

      <style>{`
        @keyframes emptyFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
      `}</style>
    </div>
  );
}

const ctaStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  background: '#2d6a4f', color: '#fff',
  padding: '10px 24px', borderRadius: '10px',
  border: 'none', cursor: 'pointer',
  fontWeight: '600', fontSize: '14px',
  textDecoration: 'none',
  transition: 'background 0.2s ease, transform 0.2s ease',
  boxShadow: '0 4px 14px rgba(45,106,79,0.25)',
};

function ProduceSvg() {
  return (
    <svg viewBox="0 0 160 140" width="160" height="140" aria-hidden="true">
      <rect width="160" height="140" fill="#f0f7f2" rx="20"/>
      {/* Basket */}
      <ellipse cx="80" cy="105" rx="45" ry="15" fill="#d7a87e"/>
      <path d="M40 90 Q42 60 80 58 Q118 60 120 90 Q100 105 80 105 Q60 105 40 90z" fill="#c8914a"/>
      <path d="M50 90 Q52 68 80 66 Q108 68 110 90" fill="none" stroke="#b87d3a" strokeWidth="2" strokeDasharray="4,3"/>
      {/* Mango */}
      <ellipse cx="70" cy="72" rx="14" ry="10" fill="#fbbf24" transform="rotate(-15 70 72)"/>
      <path d="M70 64 Q72 58 74 56" stroke="#16a34a" strokeWidth="2" fill="none"/>
      {/* Avocado */}
      <ellipse cx="92" cy="68" rx="10" ry="14" fill="#4ade80" transform="rotate(10 92 68)"/>
      <ellipse cx="92" cy="70" rx="5" ry="7"  fill="#92400e"/>
      {/* Passion fruit */}
      <circle cx="80" cy="58" r="9" fill="#a855f7"/>
      <circle cx="80" cy="58" r="5" fill="#d8b4fe" opacity="0.6"/>
      {/* Leaf */}
      <path d="M30 50 Q40 20 70 30 Q50 35 45 55z" fill="#22c55e" opacity="0.7"/>
    </svg>
  );
}

function BoxSvg() {
  return (
    <svg viewBox="0 0 160 140" width="160" height="140" aria-hidden="true">
      <rect width="160" height="140" fill="#f0f7f2" rx="20"/>
      <rect x="35" y="70" width="90" height="55" rx="6" fill="#d4aa7d"/>
      <rect x="35" y="70" width="90" height="18" rx="4" fill="#c8914a"/>
      <line x1="80" y1="70" x2="80" y2="125" stroke="#b87d3a" strokeWidth="2"/>
      <rect x="55" y="55" width="50" height="18" rx="4" fill="#e5c49a"/>
      <path d="M55 55 L80 45 L105 55" fill="#d4aa7d"/>
      <path d="M65 72 Q80 68 95 72" stroke="#b87d3a" strokeWidth="1.5" fill="none"/>
    </svg>
  );
}

function SearchSvg() {
  return (
    <svg viewBox="0 0 160 140" width="160" height="140" aria-hidden="true">
      <rect width="160" height="140" fill="#f0f7f2" rx="20"/>
      <circle cx="72" cy="65" r="35" fill="none" stroke="#52b788" strokeWidth="6"/>
      <line x1="97" y1="90" x2="125" y2="118" stroke="#52b788" strokeWidth="6" strokeLinecap="round"/>
      <line x1="58" y1="62" x2="86" y2="62" stroke="#c8e6c9" strokeWidth="3" strokeLinecap="round"/>
      <line x1="58" y1="70" x2="80" y2="70" stroke="#c8e6c9" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}
