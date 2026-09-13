import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

import App from "@/app/App";
import i18n from "@/i18n/index";

import LoadingScreen from "@/presentation/shared/components/LoadingScreen";
import { runFrontendDiagnostic } from "@/infrastructure/config/FrontendDiagnostic";
import ThemeProvider from "@/app/contexts/ThemeProvider";
import "@/presentation/styles/microinteractions.css";

import "@/index.css";
import "@/presentation/styles/styles.css";
import "@/presentation/styles/theme.css";
import "@/presentation/styles/navbar.css";
import "@/presentation/styles/footer.css";
window.MERCADOPAGO_PUBLIC_KEY =
  import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || "";

export default function MainApp() {
  const [appReady, setAppReady] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    runFrontendDiagnostic();

    let mounted = true;

    const waitForI18n = async () => {
      try {
        if (!i18n.isInitialized) {
          await i18n.init();
        }

        if (mounted) {
          setAppReady(true);
        }
      } catch (error) {
        console.error("Error inicializando internacionalización:", error);

        if (mounted) {
          setInitError(error?.message || "Error al cargar la aplicación");
          // Still mark as ready to show error state
          setAppReady(true);
        }
      }
    };

    // Timeout fallback - force app to load after 5 seconds
    const timeout = setTimeout(() => {
      if (mounted && !appReady) {
        console.warn("App initialization timeout - forcing load");
        setAppReady(true);
      }
    }, 5000);

    waitForI18n();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, []);

  if (initError) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#f8faf8",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚠️</div>
        <h1 style={{ color: "#dc2626", marginBottom: "10px" }}>Error al cargar</h1>
        <p style={{ color: "#64748b", marginBottom: "20px", maxWidth: "400px" }}>
          {initError}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "12px 24px",
            background: "#1a5c2a",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold"
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <ThemeProvider>
      {appReady ? <App /> : <LoadingScreen />}
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<MainApp />);
