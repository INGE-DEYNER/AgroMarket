import { useEffect } from "react";
import Navbar from "@/presentation/shared/components/Navbar";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAutoTranslateAll from "@/app/hooks/useAutoTranslateAll";

export default function PublicLayout({ children }) {
  const location = useLocation();
  const { i18n } = useTranslation();
  useAutoTranslateAll();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  // Re-render global cuando cambian idioma o divisa: garantiza que
  // absolutamente todo lo envuelto por PublicLayout se actualice.
  useEffect(() => {
    const onLang = () => {};
    i18n.on("languageChanged", onLang);
    const onStorage = (e) => {
      if (e.key === "divisa_preferida") window.dispatchEvent(new Event("agromarket:divisa-changed"));
    };
    window.addEventListener("storage", onStorage);
    return () => {
      i18n.off("languageChanged", onLang);
      window.removeEventListener("storage", onStorage);
    };
  }, [i18n]);

  return (
    <div className="public-shell" key={i18n.resolvedLanguage || i18n.language || "es"}>
      <Navbar />
      <main className="public-main">{children}</main>
    </div>
  );
}
