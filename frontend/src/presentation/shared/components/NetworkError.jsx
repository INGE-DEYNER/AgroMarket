// src/components/NetworkError.jsx
import { useEffect, useState } from "react";

export default function NetworkError() {
  const [visible, setVisible] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const show = () => setVisible(true);
    const hide = () => setVisible(false);
    window.addEventListener("agromarket:network-error", show);
    window.addEventListener("agromarket:network-ok", hide);
    return () => {
      window.removeEventListener("agromarket:network-error", show);
      window.removeEventListener("agromarket:network-ok", hide);
    };
  }, []);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const res = await fetch(
        (import.meta.env.VITE_API_URL || "http://localhost:8080/api") +
          "/actuator/health",
        { method: "GET", signal: AbortSignal.timeout(5000) },
      );
      if (res.ok) {
        setVisible(false);
        window.dispatchEvent(new CustomEvent("agromarket:network-ok"));
      }
    } catch {
      // Still offline — leave visible
    } finally {
      setRetrying(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9997,
        background: "rgba(248, 253, 249, 0.97)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        padding: "24px",
        animation: "fadeIn 0.3s ease",
      }}
    >
      {/* SVG Illustration — field/nature themed */}
      <svg
        viewBox="0 0 200 160"
        width="200"
        height="160"
        style={{ animation: "float 4s ease-in-out infinite" }}
        aria-hidden="true"
      >
        {/* Sky */}
        <rect width="200" height="160" fill="#f0f7f2" rx="16" />
        {/* Ground */}
        <ellipse cx="100" cy="145" rx="90" ry="20" fill="#c8e6c9" />
        {/* Hills */}
        <ellipse cx="30" cy="130" rx="50" ry="30" fill="#a5d6a7" />
        <ellipse cx="170" cy="135" rx="55" ry="28" fill="#81c784" />
        {/* Tree trunk */}
        <rect x="90" y="80" width="20" height="50" rx="4" fill="#8d6e63" />
        {/* Tree crown */}
        <circle cx="100" cy="65" r="35" fill="#2e7d32" />
        <circle cx="80" cy="70" r="22" fill="#388e3c" />
        <circle cx="120" cy="70" r="22" fill="#388e3c" />
        <circle cx="100" cy="48" r="20" fill="#43a047" />
        {/* Fruit 1 */}
        <circle cx="88" cy="62" r="6" fill="#ef5350" />
        {/* Fruit 2 */}
        <circle cx="112" cy="66" r="6" fill="#ffb300" />
        {/* Fruit 3 */}
        <circle cx="100" cy="76" r="6" fill="#ab47bc" />
        {/* Clouds */}
        <ellipse cx="40" cy="30" rx="20" ry="10" fill="#fff" opacity="0.8" />
        <ellipse cx="55" cy="25" rx="15" ry="10" fill="#fff" opacity="0.8" />
        <ellipse cx="160" cy="35" rx="18" ry="9" fill="#fff" opacity="0.7" />
        {/* Signal bars (crossed) */}
        <rect
          x="155"
          cy="10"
          x1="148"
          y1="90"
          x2="168"
          y2="90"
          width="3"
          height="8"
          rx="1.5"
          fill="#ccc"
          y="90"
        />
        <rect x="158" width="3" height="12" rx="1.5" fill="#ccc" y="86" />
        <rect x="162" width="3" height="16" rx="1.5" fill="#ccc" y="82" />
        <line
          x1="145"
          y1="82"
          x2="170"
          y2="100"
          stroke="#ef5350"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="170"
          y1="82"
          x2="145"
          y2="100"
          stroke="#ef5350"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      <div style={{ textAlign: "center", maxWidth: "380px" }}>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: "700",
            color: "#1b4332",
            marginBottom: "10px",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Sin conexión con AgroMarket
        </h2>
        <p style={{ color: "#4a5568", fontSize: "15px", lineHeight: "1.6" }}>
          No podemos comunicarnos con el servidor en este momento. Verifica tu
          conexión a internet e inténtalo de nuevo.
        </p>
      </div>

      <button
        onClick={handleRetry}
        disabled={retrying}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          background: "#2d6a4f",
          color: "#fff",
          padding: "12px 28px",
          borderRadius: "10px",
          border: "none",
          cursor: retrying ? "not-allowed" : "pointer",
          fontWeight: "700",
          fontSize: "15px",
          opacity: retrying ? 0.8 : 1,
          transition: "all 0.2s ease",
          boxShadow: "0 4px 16px rgba(45,106,79,0.3)",
        }}
        aria-label="Reintentar conexión"
      >
        {retrying ? (
          <>
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="currentColor"
              style={{ animation: "spin 0.8s linear infinite" }}
            >
              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
            Reintentando...
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
            </svg>
            Reintentar
          </>
        )}
      </button>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}


