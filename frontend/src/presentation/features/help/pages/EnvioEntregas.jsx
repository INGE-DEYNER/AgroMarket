import { useTranslation } from "react-i18next";
import PublicLayout from "@/presentation/shared/components/PublicLayout";
import "@/presentation/styles/public-views.css";

export default function EnvioEntregas() {
  const { t } = useTranslation();
  return (
    <PublicLayout>
      <div className="page-wrap info-page">
        <nav className="breadcrumb" aria-label={t("infoPages.breadcrumb", "Breadcrumb")}>
          <span>{t("nav.home", "Inicio")}</span>
          <span aria-hidden="true">›</span>
          <strong>{t("infoPages.shipping.title", "Envíos y entregas")}</strong>
        </nav>
        <section className="legal-hero">
          <div className="legal-hero-inner">
            <span className="legal-eyebrow">{t("infoPages.eyebrow", "AgroMarket · ASAFRUT")}</span>
            <h1>{t("infoPages.shipping.title", "Envíos y entregas")}</h1>
            <p>{t("infoPages.shipping.intro", "Coordinamos la entrega directa del productor a tu puerta en Urabá y a todo Colombia con transportadoras aliadas.")}</p>
            <div className="legal-meta-row">
              <span className="legal-chip">{t("infoPages.updated", "Última actualización")}: 20 de mayo de 2024</span>
              <span className="legal-chip">{t("infoPages.appliesTo", "Aplica a todo AgroMarket")}</span>
            </div>
          </div>
        </section>
        <div className="legal-grid">
          <aside className="legal-toc-card" aria-label={t("legal.toc", "Contenido")}>
            <h2>{t("legal.toc", "Contenido")}</h2>
            <ol>
              <li><a href="#info-sec-0"><span className="legal-toc-num">1</span><span>{t("infoPages.shipping.s1Title", "Cobertura y tiempos")}</span></a></li>
              <li><a href="#info-sec-1"><span className="legal-toc-num">2</span><span>{t("infoPages.shipping.s2Title", "Costos")}</span></a></li>
              <li><a href="#info-sec-2"><span className="legal-toc-num">3</span><span>{t("infoPages.shipping.s3Title", "Seguimiento")}</span></a></li>
            </ol>
          </aside>
          <article className="legal-doc-card">
            <div className="legal-doc-body">
              <section className="legal-section-card" id="info-sec-0">
                <h2>{t("infoPages.shipping.s1Title", "Cobertura y tiempos")}</h2>
                <p>{t("infoPages.shipping.s1Text", "Urabá (Apartadó, Turbo, Chigorodó, Carepa): 24 a 48 horas. Resto de Antioquia: 2 a 4 días. Nacional: 3 a 6 días hábiles según la transportadora.")}</p>
              </section>
              <section className="legal-section-card" id="info-sec-1">
                <h2>{t("infoPages.shipping.s2Title", "Costos")}</h2>
                <p>{t("infoPages.shipping.s2Text", "El costo se calcula por peso y distancia y lo ves antes de pagar en el checkout. Pedidos mayores a $150.000 COP en Urabá tienen envío gratis.")}</p>
              </section>
              <section className="legal-section-card" id="info-sec-2">
                <h2>{t("infoPages.shipping.s3Title", "Seguimiento")}</h2>
                <p>{t("infoPages.shipping.s3Text", "Sigue tu pedido en Mis pedidos / Envíos. Recibirás guía, estado y contacto del repartidor por mensajería interna.")}</p>
              </section>
              <div className="legal-callout"><span className="legal-callout-icon">✓</span><div><strong>{t("infoPages.shipping.calloutTitle", "Recibe a tiempo")}</strong><p style={{ margin: "4px 0 0" }}>{t("infoPages.shipping.calloutText", "Mantén tu dirección completa y un teléfono de contacto para evitar retrasos.")}</p></div></div>
            </div>
          </article>
        </div>
      </div>
    </PublicLayout>
  );
}

