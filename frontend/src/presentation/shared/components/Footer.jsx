import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "@/presentation/styles/footer.css";

/* ============================================================
   BENEFICIOS
   ============================================================ */
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
    FOOTER PRINCIPAL
    NO MODIFICAR LA SECCIÓN "MÁS INFORMACIÓN" ANTERIOR
====================================================== */}

<section className="am-footer-main">

  <div className="am-footer-container">

    {/* ==================================================
        IDENTIDAD
    ================================================== */}

    <div className="am-footer-brand">

      <a
        href="/"
        className="am-footer-logo-link"
        aria-label="AgroMarket"
      >
        <img
          src="/agromarket/logo.png"
          alt="AgroMarket"
          className="am-footer-logo"
        />
      </a>

      <h2 className="am-footer-tagline">
        {t("home.heroTitle")}
      </h2>

      <p className="am-footer-description">
        {t("home.footer.desc")}
      </p>

      <p className="am-footer-location">
        ASAFRUT · {t("home.footerUi.address")}, Colombia
      </p>

      <div
        className="am-footer-socials"
        aria-label={t("home.footerUi.social")}
      >

        <a
          href="https://www.facebook.com/ASAFRUT67"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="am-footer-social"
        >
          f
        </a>

        <a
          href="https://www.instagram.com/asociacion_asafrut/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="am-footer-social"
        >
          ◎
        </a>

        <a
          href="https://wa.me/573127658412"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="am-footer-social"
        >
          ◔
        </a>

      </div>

    </div>


    {/* ==================================================
        ENLACES INSTITUCIONALES
    ================================================== */}

    <div className="am-footer-column">

      <span className="am-footer-column-label">
        AgroMarket
      </span>

      <h3>
        {t("home.footerUi.institutional")}
      </h3>

      <Link to="/sobre-asafrut">
        {t("home.footerUi.about")}
      </Link>

      <Link to="/como-funciona">
        {t(
          "home.footerUi.howItWorks",
          "Cómo funciona"
        )}
      </Link>

      <Link to="/productores">
        {t(
          "home.footerUi.producers",
          "Productores"
        )}
      </Link>

    </div>


    {/* ==================================================
        AYUDA
    ================================================== */}

    <div className="am-footer-column">

      <span className="am-footer-column-label">
        AgroMarket
      </span>

      <h3>
        {t("home.footerUi.help")}
      </h3>

      <Link to="/ayuda">
        {t("home.footerUi.helpCenter")}
      </Link>

      <Link to="/envioEntregas">
        {t("home.footerUi.shippingDelivery")}
      </Link>

      <Link to="/devoluciones">
        {t("home.footerUi.returns")}
      </Link>

      <Link to="/metodosPagos">
        {t("home.footerUi.payments")}
      </Link>

    </div>


    {/* ==================================================
        CONTACTO
    ================================================== */}

    <div className="am-footer-column">

      <span className="am-footer-column-label">
        ASAFRUT
      </span>

      <h3>
        {t("home.footerUi.contact")}
      </h3>

      <span className="am-footer-contact-text">
        {t("home.footerUi.address")}
      </span>

      <a href="mailto:contacto@agro-market.app">
        contacto@agro-market.app
      </a>

      <a href="tel:+573127658412">
        +57 312 765 8412
      </a>

    </div>

  </div>

</section>


{/* ======================================================
    MÉTODOS DE PAGO
====================================================== */}

<section
  className="am-footer-payments"
  aria-label={t("home.footerUi.paymentMethods")}
>

  <div className="am-footer-container am-footer-payments-inner">

    {/* SEGURIDAD */}

    <div className="am-footer-security">

      <div className="am-footer-security-icon">
        ✓
      </div>

      <div className="am-footer-security-text">

        <strong>
          {t("home.footerUi.securePayment")}
        </strong>

        <span>
          {t("home.footerUi.protected")}
        </span>

      </div>

    </div>


    {/* MÉTODOS */}

    <div className="am-footer-payment-area">

      <span className="am-footer-payment-label">
        {t("home.footerUi.paymentMethods")}
      </span>

      <div className="am-footer-payment-list">

        {PAYMENT_LOGOS.map((payment) => (

          <div
            className="am-footer-payment-card"
            key={payment.name}
          >

            <img
              src={payment.src}
              alt={payment.name}
            />

          </div>

        ))}

      </div>

    </div>

  </div>

</section>


{/* ======================================================
    ECOSISTEMA AGROMARKET
====================================================== */}

<section
  className="am-footer-ecosystem"
  aria-label={t("home.footerUi.stakeholders")}
>

  <div className="am-footer-container">

    {/* ENCABEZADO */}

    <div className="am-footer-ecosystem-header">

      <div>

        <span className="am-footer-ecosystem-kicker">
          {t("home.footerUi.ecosystem")}
        </span>

        <h2>
          {t("home.footerUi.stakeholders")}
        </h2>

      </div>

      <p>
        {t("home.footerUi.stakeholderText")}
      </p>

    </div>


    {/* ==================================================
        PARTICIPANTES
    ================================================== */}

    <div className="am-footer-stakeholders">

      {STAKEHOLDER_LOGOS.map((logo) => (

        <article
          className={`am-footer-stakeholder ${
            logo.type === "developer"
              ? "am-footer-stakeholder-developer"
              : ""
          }`}
          key={logo.id}
        >

          <div className="am-footer-stakeholder-image">

            <img
              src={logo.src}
              alt={logo.alt}
            />

          </div>


          <div className="am-footer-stakeholder-content">

            {logo.prefix && (
              <span className="am-footer-stakeholder-prefix">
                {logo.prefix}
              </span>
            )}

            <h3>
              {logo.name}
            </h3>

            <p>
              {logo.role}
            </p>

          </div>

        </article>

      ))}

    </div>

  </div>

</section>


{/* ======================================================
    BARRA FINAL
====================================================== */}

<section className="am-footer-bottom">

  <div className="am-footer-container am-footer-bottom-inner">

    <nav
      className="am-footer-legal"
      aria-label="Enlaces legales"
    >

      <Link to="/terminos">
        {t("home.footerUi.terms")}
      </Link>

      <Link to="/privacidad">
        {t("home.footerUi.privacy")}
      </Link>

      <Link to="/cookies">
        {t("home.footerUi.cookies")}
      </Link>

      <Link to="/ayuda">
        {t("home.footerUi.help")}
      </Link>

      <button
        type="button"
        onClick={scrollToTop}
      >
        {t("home.footerUi.backTop")} ↑
      </button>

    </nav>


    <p className="am-footer-copyright">
      © {new Date().getFullYear()} AgroMarket · ASAFRUT ·{" "}
      {t("home.footerUi.rights")}
    </p>


    <p className="am-footer-colombia">
      Hecho en Colombia · Chigorodó, Antioquia
    </p>

  </div>

</section>