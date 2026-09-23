import { useTranslation } from "react-i18next";
import PublicLayout from "@/presentation/shared/components/PublicLayout";
import "@/presentation/styles/public-views.css";

export default function Devoluciones() {
  const { t } = useTranslation();
  return (
    <PublicLayout>
      <div className="page-wrap info-page">
        <nav className="breadcrumb" aria-label={t("infoPages.breadcrumb", "Breadcrumb")}>
          <span>{t("nav.home", "Inicio")}</span>
          <span aria-hidden="true">›</span>
          <strong>{t("infoPages.returns.title", "Devoluciones")}</strong>
        </nav>
        <section className="legal-hero">
          <div className="legal-hero-inner">
            <span className="legal-eyebrow">{t("infoPages.eyebrow", "AgroMarket · ASAFRUT")}</span>
            <h1>{t("infoPages.returns.title", "Devoluciones")}</h1>
            <p>{t("infoPages.returns.intro", "Si tu producto llegó en mal estado, incompleto o diferente a lo publicado, puedes solicitar la devolución desde tu cuenta.")}</p>
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
              <li><a href="#info-sec-0"><span className="legal-toc-num">1</span><span>{t("infoPages.returns.s1Title", "Plazos")}</span></a></li>
              <li><a href="#info-sec-1"><span className="legal-toc-num">2</span><span>{t("infoPages.returns.s2Title", "Cómo solicitarla")}</span></a></li>
              <li><a href="#info-sec-2"><span className="legal-toc-num">3</span><span>{t("infoPages.returns.s3Title", "Reembolsos")}</span></a></li>
            </ol>
          </aside>
          <article className="legal-doc-card">
            <div className="legal-doc-body">
              <section className="legal-section-card" id="info-sec-0">
                <h2>{t("infoPages.returns.s1Title", "Plazos")}</h2>
                <p>{t("infoPages.returns.s1Text", "Tienes hasta 24 horas después de recibir perecederos (frutas, verduras) y hasta 5 días para no perecederos (café, cacao, procesados) para reportar con fotos del producto y del empaque.")}</p>
              </section>
              <section className="legal-section-card" id="info-sec-1">
                <h2>{t("infoPages.returns.s2Title", "Cómo solicitarla")}</h2>
                <p>{t("infoPages.returns.s2Text", "Ve a Mis pedidos, elige el pedido, pulsa Reportar un problema y adjunta la evidencia. Te respondemos por mensajería y correo.")}</p>
              </section>
              <section className="legal-section-card" id="info-sec-2">
                <h2>{t("infoPages.returns.s3Title", "Reembolsos")}</h2>
                <p>{t("infoPages.returns.s3Text", "Si es aprobada, el reembolso va al mismo método de pago en 3 a 10 días hábiles. En pago contra entrega se genera cupón o reposición.")}</p>
              </section>
              <div className="legal-callout"><span className="legal-callout-icon">✓</span><div><strong>{t("infoPages.returns.calloutTitle", "Conserva la evidencia")}</strong><p style={{ margin: "4px 0 0" }}>{t("infoPages.returns.calloutText", "Guarda fotos, número de pedido y mensajes con el productor.")}</p></div></div>
            </div>
          </article>
        </div>
      </div>
    </PublicLayout>
  );
}

