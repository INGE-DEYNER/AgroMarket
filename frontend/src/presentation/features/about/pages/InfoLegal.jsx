import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PublicLayout from "@/presentation/shared/components/PublicLayout";
import Icon from "@/presentation/shared/components/Icon";
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
        <section className="legal-hero">
          <div className="legal-hero-inner">
            <nav className="breadcrumb" aria-label={t("legal.breadcrumb", "Breadcrumb")}>
              <span>{t("nav.home", "Inicio")}</span><span aria-hidden="true">›</span><strong>{t(`legal.${ns}.title`)}</strong>
            </nav>
            <span className="legal-eyebrow">{t("legal.eyebrow", "AgroMarket · ASAFRUT")}</span>
            <h1>{t(`legal.${ns}.title`)}</h1>
            <p>{t(`legal.${ns}.intro`)}</p>
            <div className="legal-meta-row">
              <span className="legal-chip"><Icon name="calendar" size={14} /> {t("legal.updated", "Última actualización")}: {t("legal.updateDate", "20 de mayo de 2024")}</span>
              <span className="legal-chip"><Icon name="globe" size={14} /> {t("legal.appliesTo", "Aplica a todo AgroMarket")}</span>
            </div>
          </div>
        </section>
        <div className="legal-grid">
          <aside className="legal-toc-card" aria-label={t("legal.toc", "Contenido")}>
            <h2>{t("legal.toc", "Contenido")}</h2>
            <ol>
              {Array.isArray(sections) && sections.map((section, index) => (
                <li key={index}>
                  <a href={`#legal-sec-${index}`}>
                    <span className="legal-toc-num">{index + 1}</span>
                    <span>{String(section.title || "").replace(/^\d+\.\s*/, "")}</span>
                  </a>
                </li>
              ))}
            </ol>
          </aside>
          <article className="legal-doc-card">
            <div className="legal-doc-body">
              {Array.isArray(sections) && sections.map((section, index) => (
                <section className="legal-section-card" id={`legal-sec-${index}`} key={index}>
                  <h2>{section.title}</h2>
                  {Array.isArray(section.paragraphs) ? section.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>) : <p>{section.text}</p>}
                </section>
              ))}
              {key === "terminos" && <div className="legal-callout"><span className="legal-callout-icon"><Icon name="check" size={16} /></span><div><strong>{t("legal.terms.acceptanceTitle")}</strong><p style={{ margin: "4px 0 0" }}>{t("legal.terms.acceptance")}</p></div></div>}
              {key === "privacidad" && <div className="legal-callout"><span className="legal-callout-icon"><Icon name="mail" size={16} /></span><div><strong>{t("legal.privacy.contactTitle")}</strong><p style={{ margin: "4px 0 0" }}>{t("legal.privacy.contact")}</p></div></div>}
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
      </div>
    </PublicLayout>
  );
}
