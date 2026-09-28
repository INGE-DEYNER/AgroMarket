import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PublicLayout from "@/presentation/shared/components/PublicLayout";
import Icon from "@/presentation/shared/components/Icon";
import {
  DOCUMENTOS_LEGALES,
  DATOS_RESPONSABLE,
} from "@/application/legal/politicasAgroMarket";
import "@/presentation/styles/public-views.css";

/** Ruta pública -> clave del documento legal. */
const CLAVE_POR_RUTA = {
  "/terminos": "terminos",
  "/privacidad": "privacidad",
  "/cookies": "cookies",
};

export default function InfoLegal() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  /*
   * El contenido viene de `politicasAgroMarket.js`, no de i18n. Los textos
   * que estaban traducidos eran genéricos ("utilizamos cookies para mejorar
   * tu experiencia") y no citaban ninguna norma: sin referencia a la Ley
   * 1581 de 2012, al RGPD ni a los derechos ARCO, la plataforma queda
   * expuesta a sanción de la SIC.
   */
  const key = CLAVE_POR_RUTA[pathname] || "terminos";
  const documento = DOCUMENTOS_LEGALES[key];
  const secciones = documento.secciones;

  const [consent, setConsent] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("agromarket-cookie-consent")
      : null,
  );
  const [showPreferences, setShowPreferences] = useState(false);

  const acceptCookies = () => {
    localStorage.setItem("agromarket-cookie-consent", "accepted");
    setConsent("accepted");
  };
  const savePreferences = () => {
    localStorage.setItem("agromarket-cookie-consent", "configured");
    setConsent("configured");
    setShowPreferences(false);
  };

  return (
    <PublicLayout>
      <div className="page-wrap">
        <section className="legal-hero">
          <div className="legal-hero-inner">
            <nav
              className="breadcrumb"
              aria-label={t("legal.breadcrumb", "Breadcrumb")}
            >
              <span>{t("nav.home", "Inicio")}</span>
              <span aria-hidden="true">›</span>
              <strong>{documento.titulo}</strong>
            </nav>
            <span className="legal-eyebrow">
              {t("legal.eyebrow", "AgroMarket · ASAFRUT")}
            </span>
            <h1>{documento.titulo}</h1>
            <p>{documento.resumen}</p>
            <div className="legal-meta-row">
              <span className="legal-chip">
                <Icon name="calendar" size={14} />{" "}
                {t("legal.updated", "Última actualización")}:{" "}
                {documento.actualizado}
              </span>
              <span className="legal-chip">
                <Icon name="globe" size={14} />{" "}
                {t("legal.appliesTo", "Vigente en")}:{" "}
                {documento.alcance.join(" · ")}
              </span>
            </div>
          </div>
          </section>

        <div className="legal-grid">
          <aside
            className="legal-toc-card"
            aria-label={t("legal.toc", "Contenido")}
          >
            <h2>{t("legal.toc", "Contenido")}</h2>
            <ol>
              {secciones.map((section, index) => (
                <li key={index}>
                  <a href={`#legal-sec-${index}`}>
                    <span className="legal-toc-num">{index + 1}</span>
                    <span>{section.titulo.replace(/^\d+\.\s*/, "")}</span>
                  </a>
                </li>
              ))}
            </ol>
          </aside>

          <article className="legal-doc-card">
            <div className="legal-doc-body">
              {secciones.map((section, index) => (
                <section
                  className="legal-section-card"
                  id={`legal-sec-${index}`}
                  key={index}
                >
                  <h2>{section.titulo}</h2>
                  {section.parrafos.map((parrafo, i) => (
                    <p key={i}>{parrafo}</p>
                  ))}
                </section>
              ))}

              {key === "terminos" && (
                <div className="legal-callout">
                  <span className="legal-callout-icon">
                    <Icon name="check" size={16} />
                  </span>
                  <div>
                    <strong>Aceptación</strong>
                    <p style={{ margin: "4px 0 0" }}>
                      Al continuar utilizando AgroMarket, aceptas estos
                      términos en su versión vigente.
                    </p>
                  </div>
                </div>
              )}

              {key === "privacidad" && (
                <div className="legal-callout">
                  <span className="legal-callout-icon">
                    <Icon name="mail" size={16} />
                  </span>
                  <div>
                    <strong>Ejercicio de derechos (ARCO)</strong>
                    <p style={{ margin: "4px 0 0" }}>
                      Escribe a {DATOS_RESPONSABLE.correo} indicando tu
                      nombre, el correo de registro y la solicitud (acceso,
                      corrección, supresión u oposición). La Superintendencia
                      de Industria y Comercio (SIC) es la autoridad de
                      control en Colombia.
                    </p>
                  </div>
                </div>
              )}

              {key === "cookies" &&
                consent !== "accepted" &&
                consent !== "configured" && (
                  <div className="cookie-actions">
                    <button
                      className="accept"
                      type="button"
                      onClick={acceptCookies}
                    >
                      Aceptar todas las cookies
                    </button>
                    <button
                      className="configure"
                      type="button"
                      onClick={() => setShowPreferences(true)}
                    >
                      Configurar preferencias
                    </button>
                  </div>
                )}

              {showPreferences && key === "cookies" && (
                <div className="cookie-preferences">
                  <p>
                    Las cookies esenciales permanecen activas porque son
                    necesarias para iniciar sesión y completar una compra.
                    Puedes rechazar las funcionales y las analíticas sin
                    perder acceso al marketplace.
                  </p>
                  <button
                    type="button"
                    className="accept"
                    onClick={savePreferences}
                  >
                    Guardar preferencias
                  </button>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </PublicLayout>
  );
}
