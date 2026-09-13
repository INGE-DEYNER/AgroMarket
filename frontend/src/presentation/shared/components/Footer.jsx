import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "@/presentation/styles/footer.css";

/* ============================================================
   STAKEHOLDERS
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
   VOLVER ARRIBA
   ============================================================ */

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
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
          MÁS INFORMACIÓN
          ESTA SECCIÓN SE MANTIENE SIN MODIFICAR
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
          ESTA SECCIÓN SE MANTIENE SIN MODIFICAR
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

            <Link to="/catalogo?ofertas=true">
              {t("home.footerUi.offers", "Ofertas")}
            </Link>

            <Link to="/productores">
              {t("home.footerUi.producers", "Productores")}
            </Link>
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

            <Link to="/como-funciona">
              {t("home.footerUi.howItWorks", "Cómo funciona")}
            </Link>

            <Link to="/terminos">{t("home.footerUi.terms")}</Link>

            <Link to="/privacidad">{t("home.footerUi.privacy")}</Link>

            <Link to="/cookies">{t("home.footerUi.cookies")}</Link>
          </nav>

          {/* AYUDA */}

          <nav className="footer-link-column" aria-labelledby="footer-help">
            <h4 id="footer-help">{t("home.footerUi.help")}</h4>

            <Link to="/ayuda">{t("home.footerUi.helpCenter")}</Link>

            <Link to="/envioEntregas">
              {t("home.footerUi.shippingDelivery")}
            </Link>

            <Link to="/devoluciones">{t("home.footerUi.returns")}</Link>

            <Link to="/metodosPagos">{t("home.footerUi.payments")}</Link>

            <Link to="/reportarProblema">{t("home.footerUi.report")}</Link>
          </nav>

          {/* REDES SOCIALES */}

          <div className="footer-link-column">
            <h4>{t("home.footerUi.social")}</h4>

            <a
              href="https://www.facebook.com//ASAFRUT67"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>

            <a
              href="https://www.instagram.com/asociacion_asafrut/?utm_source=ig_web_button_share_sheet"
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

            <Link to="/login">{t("nav.login", "Iniciar sesión")}</Link>

            <Link to="/registro">{t("nav.register", "Registrarse")}</Link>

            <Link to="/perfil">{t("nav.profile", "Mi perfil")}</Link>

            <Link to="/pedidos">{t("nav.orders", "Mis pedidos")}</Link>
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
          IDENTIDAD AGROMARKET
      ====================================================== */}

      <section className="am-footer-main">
        <div className="am-footer-container">
          <div className="am-footer-brand">
            <a href="/" className="am-footer-logo-link" aria-label="AgroMarket">
              <img
                src="/agromarket/logo.png"
                alt="AgroMarket"
                className="am-footer-logo"
              />
            </a>

            <h2>{t("home.heroTitle")}</h2>

            <p>{t("home.footer.desc")}</p>

            <div className="am-footer-brand-bottom">
              <span>ASAFRUT · {t("home.footerUi.address")}, Colombia</span>

              <div
                className="am-footer-socials"
                aria-label={t("home.footerUi.social")}
              >
                <a
                  href="https://www.facebook.com/ASAFRUT67"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  f
                </a>

                <a
                  href="https://www.instagram.com/asociacion_asafrut/?utm_source=ig_web_button_share_sheet"
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
          </div>
        </div>
      </section>

      {/* ======================================================
          PAGOS + PROJECT PARTNERS
      ====================================================== */}

      <section
        className="am-footer-services"
        aria-label="Payments and project partners"
      >
        <div className="am-footer-container">
          <div className="am-footer-services-grid">
            {/* ==================================================
                PAGOS
            ================================================== */}

            <div className="am-footer-payment-block">
              <div className="am-footer-block-heading">
                <span className="am-footer-heading-kicker">
                  Secure payments
                </span>

                <h3>{t("home.footerUi.securePayment")}</h3>

                <p>{t("home.footerUi.protected")}</p>
              </div>

              <div className="am-footer-payment-methods">
                <span className="am-footer-method-label">
                  {t("home.footerUi.paymentMethods")}
                </span>

                <div
                  className="am-footer-payment-viewport"
                  role="region"
                  aria-label="Carrusel de métodos de pago aceptados"
                >
                  {/* style inline = se mueve aunque el footer.css esté en caché */}
                  <div
                    className="am-footer-payment-track"
                    style={{
                      width: "max-content",
                      maxWidth: "none",
                      display: "flex",
                      flexWrap: "nowrap",
                      alignItems: "center",
                      gap: 0,
                      animation:
                        "am-footer-partners-scroll 16s linear infinite",
                      willChange: "transform",
                    }}
                  >
                    {[0, 1, 2, 3].map((copy) => (
                      <div
                        className="am-footer-payment-track-group"
                        aria-hidden={copy === 0 ? undefined : "true"}
                        key={`pay-copy-${copy}`}
                        style={{
                          display: "flex",
                          flexWrap: "nowrap",
                          alignItems: "center",
                          flexShrink: 0,
                          gap: 8,
                          paddingRight: 8,
                        }}
                      >
                        {PAYMENT_LOGOS.map((payment) => (
                          <div
                            className="am-footer-payment-card"
                            key={`${copy}-${payment.name}`}
                          >
                            <img
                              src={payment.src}
                              alt={copy === 0 ? payment.name : ""}
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================
                PROJECT PARTNERS
            ================================================== */}

            <div className="am-footer-partners-block">
              <div className="am-footer-block-heading">
                <span className="am-footer-heading-kicker">
                  AgroMarket ecosystem
                </span>

                <h3>Project partners &amp; stakeholders</h3>
              </div>

              <div
                className="am-footer-partners-carousel"
                role="region"
                aria-label="Carrusel de aliados del ecosistema AgroMarket"
              >
                <span
                  className="am-footer-partners-arrow am-footer-partners-arrow-left"
                  aria-hidden="true"
                >
                  ←
                </span>

                <div className="am-footer-partners-viewport">
                  {/* style inline = el carrusel se mueve aunque el footer.css esté en caché */}
                  <div
                    className="am-footer-partners-track am-footer-partners-track--css"
                    style={{
                      width: "max-content",
                      maxWidth: "none",
                      display: "flex",
                      flexWrap: "nowrap",
                      alignItems: "stretch",
                      gap: 0,
                      animation:
                        "am-footer-partners-scroll 18s linear infinite",
                      willChange: "transform",
                    }}
                  >
                    {[0, 1, 2, 3].map((copy) => (
                      <div
                        className="am-footer-partners-group"
                        aria-hidden={copy === 0 ? undefined : "true"}
                        key={`partners-copy-${copy}`}
                      >
                        {STAKEHOLDER_LOGOS.map((logo) => (
                          <article
                            className={`am-footer-partner ${
                              logo.type === "developer"
                                ? "am-footer-partner-developer"
                                : ""
                            }`}
                            key={`${copy}-${logo.id}`}
                            tabIndex={copy === 0 ? undefined : -1}
                          >
                            <div className="am-footer-partner-logo">
                              <img
                                src={logo.src}
                                alt={copy === 0 ? logo.alt : ""}
                                loading="lazy"
                              />
                            </div>

                            <div className="am-footer-partner-info">
                              {logo.prefix && <span>{logo.prefix}</span>}

                              <strong>{logo.name}</strong>

                              <p>{logo.role}</p>
                            </div>
                          </article>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <span
                  className="am-footer-partners-arrow am-footer-partners-arrow-right"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>

              <p className="am-footer-partners-hint" aria-hidden="true">
                Carrusel continuo · en movimiento
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          AGROMARKET ECOSYSTEM
      ====================================================== */}

      <section className="am-footer-ecosystem">
        <div className="am-footer-container">
          <div className="am-footer-ecosystem-content">
            <div>
              <span>AGROMARKET ECOSYSTEM</span>

              <h2>Our ecosystem</h2>
            </div>

            <p>
              Spaces for ASAFRUT, related entities, institutional partners and
              those responsible for developing the platform.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          BARRA LEGAL
      ====================================================== */}

      <section className="am-footer-bottom">
        <div className="am-footer-container">
          {/* ENLACES */}

          <div className="am-footer-bottom-top">
            <nav className="am-footer-legal" aria-label="Enlaces legales">
              <Link to="/terminos">{t("home.footerUi.terms")}</Link>

              <Link to="/privacidad">{t("home.footerUi.privacy")}</Link>

              <Link to="/cookies">{t("home.footerUi.cookies")}</Link>

              <Link to="/ayuda">{t("home.footerUi.help")}</Link>
            </nav>

            <button
              type="button"
              onClick={scrollToTop}
              className="am-footer-back-top"
            >
              {t("home.footerUi.backTop")} ↑
            </button>
          </div>

          {/* COPYRIGHT */}

          <div className="am-footer-bottom-final">
            <span>
              © {new Date().getFullYear()} AgroMarket · ASAFRUT ·{" "}
              {t("home.footerUi.rights")}
            </span>

            <span>Hecho en Colombia · Chigorodó, Antioquia</span>
          </div>
        </div>
      </section>
    </footer>
  );
}
