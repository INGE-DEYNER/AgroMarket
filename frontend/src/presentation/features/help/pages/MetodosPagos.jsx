import { useTranslation } from "react-i18next";
import PublicLayout from "@/presentation/shared/components/PublicLayout";
import "@/presentation/styles/public-views.css";

const METHODS = [
  { icon: "💳", key: "card" },
  { icon: "🏦", key: "pse" },
  { icon: "📱", key: "wallet" },
  { icon: "💵", key: "cash" },
];

export default function MetodosPagos() {
  const { t } = useTranslation();
  return (
    <PublicLayout>
      <div className="page-wrap info-page">
        <nav className="breadcrumb" aria-label={t("infoPages.breadcrumb", "Breadcrumb")}>
          <span>{t("nav.home", "Inicio")}</span>
          <span aria-hidden="true">›</span>
          <strong>{t("infoPages.payments.title", "Métodos de pago")}</strong>
        </nav>
        <section className="legal-hero">
          <div className="legal-hero-inner">
            <span className="legal-eyebrow">{t("infoPages.eyebrow", "AgroMarket · ASAFRUT")}</span>
            <h1>{t("infoPages.payments.title", "Métodos de pago")}</h1>
            <p>{t("infoPages.payments.intro", "Paga de forma segura con tarjeta, PSE, billeteras digitales o contra entrega según tu ubicación.")}</p>
            <div className="legal-meta-row">
              <span className="legal-chip">{t("infoPages.secure", "Pago 100% seguro")}</span>
              <span className="legal-chip">{t("infoPages.appliesTo", "Aplica a todo AgroMarket")}</span>
            </div>
          </div>
        </section>
        <div className="info-cards">
          {METHODS.map((m) => (
            <article className="info-method-card" key={m.key}>
              <span className="info-method-icon" aria-hidden="true">{m.icon}</span>
              <h2>{t(`infoPages.payments.${m.key}Title`, m.key)}</h2>
              <p>{t(`infoPages.payments.${m.key}Text`, "")}</p>
            </article>
          ))}
        </div>
        <article className="legal-doc-card info-note">
          <div className="legal-doc-body">
            <section className="legal-section-card">
              <h2>{t("infoPages.payments.securityTitle", "Seguridad")}</h2>
              <p>{t("infoPages.payments.securityText", "Tus datos viajan cifrados por Mercado Pago. AgroMarket nunca guarda el número completo de tu tarjeta.")}</p>
            </section>
          </div>
        </article>
      </div>
    </PublicLayout>
  );
}

