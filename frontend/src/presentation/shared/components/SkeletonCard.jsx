// src/components/SkeletonCard.jsx

/**
 * Reusable skeleton card for product listings.
 * Pass count={N} to render N skeleton cards.
 */
function SkeletonCard() {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid rgba(45,106,79,0.06)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      {/* Image area */}
      <div style={{
        width: '100%', aspectRatio: '4/3',
        background: 'linear-gradient(90deg, #e8f5ec 25%, #d4edd8 50%, #e8f5ec 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }} />

      {/* Content area */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Bone width="70%" height="16px" />
        <Bone width="45%" height="13px" />
        <Bone width="35%" height="20px" />
        <Bone width="100%" height="38px" borderRadius="8px" />
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </div>
  );
}

function Bone({ width = '100%', height = '14px', borderRadius = '6px' }) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'linear-gradient(90deg, #e8f5ec 25%, #d4edd8 50%, #e8f5ec 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  );
}

/** Render N skeleton cards in a grid */
export function SkeletonGrid({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}

export { Bone };
export default SkeletonCard;


