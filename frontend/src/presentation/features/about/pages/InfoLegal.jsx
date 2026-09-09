import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PublicLayout from "@/presentation/shared/components/PublicLayout";
import "@/presentation/styles/public-views.css";

const DOC_KEYS = { terminos: "terms", privacidad: "privacy", cookies: "cookies" };

export default function InfoLegal() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const key = pathname.includes("privacidad") ? "privacidad" : pathname.includes("cookies") ? "cookies" : "terminos";
  const ns = DOC_KEYS[key];
  const [consent, setConsent] = useState(() => typeof window !== "undefined" ? localStorage.getItem("agromarket-cookie-consent") : null);
  const [showPreferences, setShowPreferences] = useState(false);
  const sections = t(`legal.${ns}.sections`, { returnObjects: true });

  const acceptCookies = () => { localStorage.setItem("agromarket-cookie-consent", "accepted"); setConsent("accepted"); };
  const savePreferences = () => { localStorage.setItem("agromarket-cookie-consent", "configured"); setConsent("configured"); setShowPreferences(false); };

  return (
    <PublicLayout>
      <div className="page-wrap">
        <article className="legal-page">
          <nav className="breadcrumb" aria-label={t("legal.breadcrumb", "Breadcrumb")}>
            <span>{t("nav.home", "Inicio")}</span><span aria-hidden="true">›</span><strong>{t(`legal.${ns}.title`)}</strong>
          </nav>
          <header className="legal-page-header">
            <h1>{t(`legal.${ns}.title`)}</h1>
            <p>{t(`legal.${ns}.intro`)}</p>
            <div className="legal-page__updated">{t("legal.updated", "Última actualización")}: {t("legal.updateDate", "20 de mayo de 2024")}</div>
          </header>
          <div className="legal-page-content">
            {Array.isArray(sections) && sections.map((section, index) => (
              <section className="legal-section" key={index}>
                <h2>{section.title}</h2>
                {Array.isArray(section.paragraphs) ? section.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>) : <p>{section.text}</p>}
              </section>
            ))}
            {key === "terminos" && <div className="legal-note"><strong>{t("legal.terms.acceptanceTitle")}</strong><p>{t("legal.terms.acceptance")}</p></div>}
            {key === "privacidad" && <div className="legal-note"><strong>{t("legal.privacy.contactTitle")}</strong><p>{t("legal.privacy.contact")}</p></div>}
            {key === "cookies" && (consent !== "accepted" && consent !== "configured") && (
              <div className="cookie-actions">
                <button className="accept" type="button" onClick={acceptCookies}>{t("legal.cookies.acceptAll")}</button>
                <button className="configure" type="button" onClick={() => setShowPreferences(true)}>{t("legal.cookies.configure")}</button>
              </div>
            )}
            {showPreferences && key === "cookies" && (
              <div className="cookie-preferences">
                <p>{t("legal.cookies.preferencesText")}</p>
                <button type="button" className="accept" onClick={savePreferences}>{t("legal.cookies.savePreferences")}</button>
              </div>
            )}
          </div>
        </article>
      </div>
    </PublicLayout>
  );
}
