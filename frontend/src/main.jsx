import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

import App from "@/app/App";
import i18n from "@/i18n/index";

import LoadingScreen from "@/presentation/shared/components/LoadingScreen";
import { runFrontendDiagnostic } from "@/infrastructure/config/FrontendDiagnostic";
import { ThemeProvider } from "@/app/contexts/ThemeContext";

import "@/index.css";
import "@/presentation/styles/styles.css";
import "@/presentation/styles/theme.css";
window.MERCADOPAGO_PUBLIC_KEY =
  import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || "";

export default function MainApp() {
  const [appReady, setAppReady] = useState(false);

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
          setAppReady(true);
        }
      }
    };

    waitForI18n();

    return () => {
      mounted = false;
    };
  }, []);

  if (!appReady) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<MainApp />);
