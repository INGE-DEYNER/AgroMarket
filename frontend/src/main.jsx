import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "@/app/App";
import i18n from "@/i18n/index";
import LoadingScreen from "@/presentation/shared/components/LoadingScreen";
import { runFrontendDiagnostic } from "@/infrastructure/config/FrontendDiagnostic";
import { ThemeProvider } from "@/app/contexts/ThemeContext";
import "@/index.css";

window.MERCADOPAGO_PUBLIC_KEY =
  import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || "";

export default function MainApp() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    runFrontendDiagnostic();

    let mounted = true;

    i18n.init().then(() => {
      if (mounted) {
        setAppReady(true);
      }
    });

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
