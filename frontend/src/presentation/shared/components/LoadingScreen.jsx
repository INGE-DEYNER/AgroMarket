// src/components/LoadingScreen.jsx
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    // Simulate loading progress — real data loads in ~1.2s
    const steps = [
      { delay: 100, value: 20 },
      { delay: 400, value: 50 },
      { delay: 800, value: 75 },
      { delay: 1200, value: 90 },
      { delay: 1400, value: 100 },
    ];
    const timers = steps.map(({ delay, value }) =>
      setTimeout(() => setProgress(value), delay),
    );
    // Text fade-in after logo pulse
    const textTimer = setTimeout(() => setTextVisible(true), 300);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(textTimer);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background:
          "linear-gradient(160deg, #0d2b16 0%, #1a3d1f 50%, #12341a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "28px",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(82,183,136,0.15) 0%, transparent 70%)",
          filter: "none",
          pointerEvents: "none",
        }}
      />

      {/* Logo with pulse */}
      <div
        style={{
          animation: "pulseSoft 2s ease-in-out infinite",
          position: "relative",
        }}
      >
        <img
          src="/agromarket/logo.png"
          alt="ASAFRUT Logo"
          style={{
            width: "100px",
            height: "100px",
            objectFit: "contain",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
          onError={(e) => {
            // Fallback to SVG leaf if image not found
            e.currentTarget.style.display = "none";
            const svg = document.createElement("div");
            svg.innerHTML = `<svg viewBox="0 0 24 24" width="80" height="80" fill="#52b788"><path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z"/></svg>`;
            e.currentTarget.parentNode?.appendChild(svg.firstChild);
          }}
        />
      </div>

      {/* Brand text */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          opacity: textVisible ? 1 : 0,
          transform: textVisible ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <div
          style={{
            color: "#ffffff",
            fontSize: "28px",
            fontWeight: "800",
            letterSpacing: "3px",
            fontFamily: "'Outfit', sans-serif",
            textTransform: "uppercase",
          }}
        >
          AgroMarket
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "12px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          ASAFRUT · Urabá, Antioquia
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: "200px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "3px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "99px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #52b788, #95d5b2)",
              borderRadius: "99px",
              transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 0 8px rgba(82,183,136,0.8)",
            }}
          />
        </div>
        {/* Animated dots */}
        <div style={{ display: "flex", gap: "6px" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "rgba(82,183,136,0.7)",
                animation: `dotBounce 1.2s ${i * 0.2}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulseSoft {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.95; }
        }
        @keyframes dotBounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
