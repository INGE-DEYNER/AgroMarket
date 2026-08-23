import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "@/presentation/styles/footer.css";

/* ============================================================
   BENEFICIOS
   ============================================================ */

const TRUST_ITEMS = [
  { icon: "▣", key: "secure", textKey: "secureText" },
  { icon: "▤", key: "shipping", textKey: "shippingText" },
  { icon: "♧", key: "fresh", textKey: "freshText" },
  { icon: "◇", key: "support", textKey: "supportText" },
  { icon: "◎", key: "customer", textKey: "customerText" },
];

/* ============================================================
   STAKEHOLDERS
   TODO:
   ASAFRUT + SIC + DESARROLLADOR
   ESTÁN EN EL MISMO CARRUSEL
   ============================================================ */

const STAKEHOLDER_LOGOS = [
  {
    id: "asafrut",
    name: "ASAFRUT",
    src: "/by/asafrut.jpg",
    alt: "ASAFRUT - Asociación Agropecuaria El Sabor de las Frutas y el Campo",
    role: "Organización promotora de AgroMarket",
    type: "organization",
  },
  {
    id: "sic",
    name: "SIC",
    src: "/stakeholders/sic.svg",
    alt: "Superintendencia de Industria y Comercio",
    role: "Entidad relacionada con el proyecto",
    type: "organization",
  },
  {
    id: "developer",
    name: "Deyner Chaverra",
    src: "/by/DeyDev.png",
    alt: "DeyDev - creador y desarrollador de AgroMarket",
    role: "Desarrollador de AgroMarket",
    type: "developer",
    prefix: "Desarrollado por",
  },
];

/* ============================================================
   MÉTODOS DE PAGO
   ============================================================ */

const PAYMENT_LOGOS = [
  {
    name: "Visa",
    src: "/payments/visa.svg",
  },
  {
    name: "Mastercard",
    src: "/payments/mastercard.svg",
  },
  {
    name: "Mercado Pago",
    src: "/payments/mercadopago.svg",
  },
  {
    name: "PSE",
    src: "/payments/pse.svg",
  },
  {
    name: "Nequi",
    src: "/payments/nequi.svg",
  },
  {
    name: "Daviplata",
    src: "/payments/daviplata.svg",
  },
];

/* ============================================================
   CHATBOT
   ============================================================ */

function openChatbot() {
  const trigger = document.querySelector(".chatbot-trigger");

  if (trigger) {
    trigger.click();
  }
}

/* ============================================================
   VOLVER ARRIBA
   ============================================================ */

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/* ============================================================
   MARQUEE / CARRUSEL INFINITO
   ============================================================ */

function MarqueeGroup({ items, renderItem, itemKeyPrefix, className = "" }) {
  return (
    <div className={`footer-marquee ${className}`.trim()}>
      <div className="footer-marquee-track">
        {/* PRIMER GRUPO */}
        <div className="footer-marquee-group">
          {items.map((item, index) =>
            renderItem(item, `${itemKeyPrefix}-a-${index}`, false),
          )}
        </div>

        {/* SEGUNDO GRUPO
            Se duplica únicamente para conseguir
            un desplazamiento continuo/infinito.
        */}
        <div className="footer-marquee-group" aria-hidden="true">
          {items.map((item, index) =>
            renderItem(item, `${itemKeyPrefix}-b-${index}`, true),
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENTE FOOTER
   ============================================================ */

export default function Footer() {
  const { t } = useTranslation();

  const [moreInfoOpen, setMoreInfoOpen] = useState(false);

  return (
    <footer className="footer-ml-style">
      {/* ======================================================
          BENEFICIOS
          ====================================================== */}

      <section
        className="footer-trust"
        aria-label={t("home.footerUi.benefits")}
      >
        <div className="footer-container footer-trust-grid">
          {TRUST_ITEMS.map((item) => (
            <article
              className="footer-trust-card"
              key={t(`home.footerUi.${item.key}`)}
            >
              <div className="footer-trust-icon" aria-hidden="true">
                {item.icon}
              </div>

              <h3>{t(`home.footerUi.${item.key}`)}</h3>

              <p>{t(`home.footerUi.${item.textKey}`)}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ======================================================
          MÁS INFORMACIÓN
          ====================================================== */}

      <div className="footer-more-bar">
        <button
          type="button"
          className={`footer-more-button${moreInfoOpen ? " is-open" : ""}`}
          aria-expanded={moreInfoOpen}
          aria-controls="agromarket-footer-more"
          onClick={() => setMoreInfoOpen((open) => !open)}
        >
          <span>{t("home.footerUi.more")}</span>

          <span className="footer-more-chevron" aria-hidden="true">
            {moreInfoOpen ? "⌃" : "⌄"}
          </span>
        </button>
      </div>

      {/* ======================================================
          PANEL DE INFORMACIÓN
          ====================================================== */}

      <div
        id="agromarket-footer-more"
        className={`footer-more-panel${moreInfoOpen ? " is-open" : ""}`}
        aria-hidden={!moreInfoOpen}
      >
        <div className="footer-container footer-links-grid">
          {/* COMPRAR */}
          <nav className="footer-link-column" aria-labelledby="footer-buy">
            <h4 id="footer-buy">{t("home.footerUi.buy")}</h4>

            <Link to="/catalogo">{t("home.footerUi.catalogProducts")}</Link>

            <Link to="/catalogo?ofertas=true">Ofertas</Link>

            <Link to="/productores">Productores</Link>

            <Link to="/como-funciona">Cómo funciona</Link>
          </nav>

          {/* INSTITUCIONAL */}
          <nav
            className="footer-link-column"
            aria-labelledby="footer-institutional"
          >
            <h4 id="footer-institutional">
              {t("home.footerUi.institutional")}
            </h4>

            <Link to="/sobre-asafrut">{t("home.footerUi.about")}</Link>

            <Link to="/como-funciona">Cómo funciona</Link>

            <Link to="/terminos">{t("home.footerUi.terms")}</Link>

            <Link to="/privacidad">{t("home.footerUi.privacy")}</Link>

            <Link to="/cookies">{t("home.footerUi.cookies")}</Link>
          </nav>

          {/* AYUDA */}
          <nav className="footer-link-column" aria-labelledby="footer-help">
            <h4 id="footer-help">{t("home.footerUi.help")}</h4>

            <Link to="/ayuda">{t("home.footerUi.helpCenter")}</Link>

            <Link to="/ayuda">{t("home.footerUi.shippingDelivery")}</Link>

            <Link to="/ayuda">{t("home.footerUi.returns")}</Link>

            <Link to="/ayuda">{t("home.footerUi.payments")}</Link>

            <button
              type="button"
              className="footer-text-button"
              onClick={openChatbot}
            >
              {t("home.footerUi.report")}
            </button>
          </nav>

          {/* REDES SOCIALES */}
          <div className="footer-link-column">
            <h4>{t("home.footerUi.social")}</h4>

            <a
              href="https://www.facebook.com/asafrut"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>

            <a
              href="https://www.instagram.com/asafrut"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>

            <a
              href="https://wa.me/573127658412?text=Hola%2C%20necesito%20ayuda%20con%20AgroMarket"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>

          {/* CUENTA */}
          <div className="footer-link-column">
            <h4>{t("home.footerUi.account")}</h4>

            <Link to="/login">Iniciar sesión</Link>

            <Link to="/registro">Registrarse gratis</Link>

            <Link to="/perfil">Mi perfil</Link>

            <Link to="/pedidos">Mis pedidos</Link>
          </div>

          {/* CONTACTO */}
          <div className="footer-link-column">
            <h4>{t("home.footerUi.contact")}</h4>

            <span>{t("home.footerUi.address")}</span>

            <a href="mailto:contacto@agro-market.app">
              contacto@agro-market.app
            </a>

            <a href="tel:+573127658412">+57 312 765 8412</a>
          </div>
        </div>
      </div>

      {/* ======================================================
          FOOTER PRINCIPAL VERDE
          ====================================================== */}

      <section className="footer-main-green">
        <div className="footer-container footer-main-grid">
          {/* MARCA */}
          <div className="footer-brand-block">
            <a href="/" className="footer-brand" aria-label="AgroMarket">
              <img
                src="/agromarket/logo.png"
                alt="AgroMarket"
                className="footer-brand-image"
              />
            </a>

            <p className="footer-tagline">{t("home.heroTitle")}</p>

            <p className="footer-description">{t("home.footer.desc")}</p>

            <div className="footer-contact-summary">
              <span>ASAFRUT · {t("home.footerUi.address")}, Colombia</span>
            </div>

            <div
              className="footer-social-row"
              aria-label={t("home.footerUi.social")}
            >
              <a
                href="https://www.facebook.com/asafrut"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                f
              </a>

              <a
                href="https://www.instagram.com/asafrut"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                ◎
              </a>

              <a
                href="https://wa.me/573127658412"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                ◔
              </a>
            </div>
          </div>

          {/* NEWSLETTER */}
          <div className="footer-newsletter-block">
            <span className="footer-section-kicker">AgroMarket</span>

            <h2>{t("home.footerUi.newsletterTitle")}</h2>

            <p>{t("home.footerUi.newsletterText")}</p>

            <a
              className="footer-contact-button"
              href="mailto:contacto@agro-market.app?subject=Quiero%20recibir%20novedades%20de%20AgroMarket"
            >
              {t("home.footerUi.contactEmail")}
            </a>
          </div>
        </div>
      </section>

      {/* ======================================================
          MÉTODOS DE PAGO
          ESTE CARRUSEL ES INDEPENDIENTE DEL DE STAKEHOLDERS
          ====================================================== */}

      <section
        className="footer-payments"
        aria-label={t("home.footerUi.paymentMethods")}
      >
        <div className="footer-container footer-payments-inner">
          <div className="footer-secure-label">
            <span className="footer-secure-check" aria-hidden="true">
              ✓
            </span>

            <div>
              <strong>{t("home.footerUi.securePayment")}</strong>

              <span>{t("home.footerUi.protected")}</span>
            </div>
          </div>

          <div className="footer-payment-title">
            <span>{t("home.footerUi.paymentMethods")}</span>
          </div>

          <MarqueeGroup
            items={PAYMENT_LOGOS}
            itemKeyPrefix="payment"
            className="footer-payment-marquee"
            renderItem={(payment, key, duplicate) => (
              <div
                className="footer-payment-item"
                key={key}
                aria-hidden={duplicate}
              >
                <img src={payment.src} alt={duplicate ? "" : payment.name} />
              </div>
            )}
          />
        </div>
      </section>

      {/* ======================================================
          STAKEHOLDERS
          ====================================================== */}

      <section
        className="footer-partners"
        aria-label={t("home.footerUi.stakeholders")}
      >
        <div className="footer-container">
          {/* CABECERA */}
          <div className="footer-partners-header">
            <div>
              <span className="footer-section-kicker footer-section-kicker-dark">
                {t("home.footerUi.ecosystem")}
              </span>

              <h2>{t("home.footerUi.stakeholders")}</h2>
            </div>

            <p>{t("home.footerUi.stakeholderText")}</p>
          </div>

          {/* ==================================================
              ÚNICO CARRUSEL DE STAKEHOLDERS

              ASAFRUT
              SIC
              DEYNER CHAVERRA

              TODOS SE DESPLAZAN JUNTOS.
              ================================================== */}

          <MarqueeGroup
            items={STAKEHOLDER_LOGOS}
            itemKeyPrefix="stakeholder"
            className="footer-stakeholder-marquee"
            renderItem={(logo, key, duplicate) => (
              <article
                className={`footer-stakeholder-card ${
                  logo.type === "developer"
                    ? "footer-stakeholder-card--developer"
                    : ""
                }`}
                key={key}
                aria-hidden={duplicate}
              >
                {/* LOGO */}
                <img src={logo.src} alt={duplicate ? "" : logo.alt} />

                {/* INFORMACIÓN */}
                <div className="footer-stakeholder-info">
                  {logo.prefix && (
                    <span className="footer-stakeholder-prefix">
                      {logo.prefix}
                    </span>
                  )}

                  <strong>{logo.name}</strong>

                  <span>{logo.role}</span>
                </div>
              </article>
            )}
          />
        </div>
      </section>

      {/* ======================================================
          BARRA LEGAL
          ====================================================== */}

      <section className="footer-bottom">
        <div className="footer-container footer-bottom-inner">
          <div className="footer-legal-links">
            <Link to="/terminos">{t("home.footerUi.terms")}</Link>

            <Link to="/privacidad">{t("home.footerUi.privacy")}</Link>

            <Link to="/cookies">{t("home.footerUi.cookies")}</Link>

            <Link to="/ayuda">{t("home.footerUi.help")}</Link>

            <button type="button" onClick={scrollToTop}>
              {t("home.footerUi.backTop")}
            </button>
          </div>

          <p>
            © {new Date().getFullYear()} AgroMarket · ASAFRUT ·{" "}
            {t("home.footerUi.rights")}
          </p>

          <p className="footer-made-colombia">
            Hecho en Colombia · {t("home.footerUi.address")}
          </p>
        </div>
      </section>
    </footer>
  );
}
