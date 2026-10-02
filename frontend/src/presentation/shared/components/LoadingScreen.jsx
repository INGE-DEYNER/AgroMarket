import { useEffect, useState } from "react";
import "@/presentation/styles/loading-screen.css";

/**
 * Pantalla de carga inicial.
 *
 * Los estilos viven en `loading-screen.css` (y no en `style={{}}` inline)
 * porque el halo y la barra usaban anchos fijos de 400px/200px que se salían
 * de la pantalla en móviles estrechos. Con `min()` y `clamp()` se adaptan al
 * viewport sin necesidad de media queries.
 *
 * La barra es decorativa: representa la carga real de la sesión, no un
 * porcentaje de descargas. Por eso los pasos están fijos en el tiempo en vez
 * de depender de eventos que no existen todavía.
 */
export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
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
    const textTimer = setTimeout(() => setTextVisible(true), 300);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(textTimer);
    };
  }, []);

  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-screen__glow" aria-hidden="true" />

      <div className="loading-screen__logo">
        <img
          src="/agromarket/logo.webp"
          alt="ASAFRUT"
          onError={(e) => {
            // Si la imagen no existe, se sustituye por una hoja SVG para que
            // la pantalla no quede con un icono roto.
            e.currentTarget.style.display = "none";
            const hoja = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "svg",
            );
            hoja.setAttribute("viewBox", "0 0 24 24");
            hoja.setAttribute("width", "80");
            hoja.setAttribute("height", "80");
            hoja.setAttribute("fill", "#52b788");
            hoja.innerHTML =
              '<path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z"/>';
            e.currentTarget.parentNode?.appendChild(hoja);
          }}
        />
      </div>

      <div
        className={
          "loading-screen__brand" +
          (textVisible ? " loading-screen__brand--visible" : "")
        }
      >
        <div className="loading-screen__title">AgroMarket</div>
        <div className="loading-screen__subtitle">
          ASAFRUT · Urabá, Antioquia
        </div>
      </div>

      <div className="loading-screen__progress">
        <div
          className="loading-screen__track"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="loading-screen__bar"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="loading-screen__dots" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="loading-screen__dot"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

