import { useState } from "react";
import { Link } from "react-router-dom";

// Función para abrir el chatbot de soporte flotante
function openChatbot() {
  // El chatbot está montado globalmente; dispara un click en el trigger
  const trigger = document.querySelector(".chatbot-trigger");
  if (trigger) trigger.click();
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleNewsletterSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: conectar con el endpoint real de suscripción
    setSubscribed(true);
    setEmail("");
  }

  const year = new Date().getFullYear();

  return (
    <footer className="footer-pro">
      {/* Fila 1: Links principales */}
      <div className="footer-main">
        <div className="footer-col footer-col-brand">
          <Link
            to="/home"
            className="footer-logo"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <img
              src="/logo-asafrut.jpg"
              alt="Logo ASAFRUT"
              style={{
                height: "48px",
                width: "auto",
                borderRadius: "8px",
                objectFit: "contain",
              }}
            />
            <span style={{ fontWeight: "700", fontSize: "1.25rem" }}>
              AgroMarket
            </span>
          </Link>
          <p className="footer-tagline">Del campo de Urabá a tu mesa.</p>
          <p className="footer-desc">
            Plataforma oficial de ASAFRUT — Asociación Agropecuaria El Sabor de
            las Frutas y el Campo. Chigorodó, Antioquia, Colombia.
          </p>

          <form className="footer-newsletter" onSubmit={handleNewsletterSubmit}>
            <label
              htmlFor="footer-newsletter-email"
              className="footer-newsletter-label"
            >
              Recibe las cosechas y ofertas de temporada
            </label>
            <div className="footer-newsletter-row">
              <input
                id="footer-newsletter-email"
                type="email"
                required
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Correo electrónico para suscribirte"
              />
              <button type="submit">Suscribirme</button>
            </div>
            <p
              className="footer-newsletter-msg"
              role="status"
              aria-live="polite"
            >
              {subscribed ? "¡Listo! Revisa tu correo pronto." : ""}
            </p>
          </form>
        </div>

        <nav className="footer-col" aria-labelledby="footer-col-plataforma">
          <h4 id="footer-col-plataforma">Plataforma</h4>
          <Link to="/catalogo">Catálogo de productos</Link>
          <Link to="/como-funciona">Cómo funciona</Link>
          <Link to="/sobre-asafrut">Sobre ASAFRUT</Link>
          <Link to="/productores">Nuestros productores</Link>
          <Link to="/home#testimonios">Testimonios</Link>
        </nav>

        <nav className="footer-col" aria-labelledby="footer-col-acceso">
          <h4 id="footer-col-acceso">Acceso</h4>
          <Link to="/login">Iniciar sesión</Link>
          <Link to="/registro">Registrarse gratis</Link>
          <Link to="/registro?rol=PRODUCTOR">Soy productor</Link>
          <Link to="/registro?rol=EMPRESA">Soy empresa / frutería</Link>
        </nav>

        <nav className="footer-col" aria-labelledby="footer-col-soporte">
          <h4 id="footer-col-soporte">Soporte</h4>
          <Link to="/ayuda">Centro de ayuda</Link>
          {/* Reportar problema: abre el chatbot para reportar */}
          <button
            type="button"
            className="footer-link-btn"
            onClick={openChatbot}
          >
            Reportar problema
          </button>
          <Link to="/terminos">Términos de uso</Link>
          <Link to="/privacidad">Política de privacidad</Link>
          <Link to="/cookies">Política de cookies</Link>
        </nav>

        <div className="footer-col">
          <h4>Contacto</h4>

          <span className="footer-contact-item">
            <svg
              className="footer-contact-icon"
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C7.86 2 4.5 5.36 4.5 9.5c0 5.25 6.5 11.5 7.05 12 .26.24.64.24.9 0 .55-.5 7.05-6.75 7.05-12C19.5 5.36 16.14 2 12 2zm0 10.25a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5z" />
            </svg>
            Chigorodó, Antioquia
          </span>

          <a
            href="mailto:contacto@agro-market.app"
            className="footer-contact-item"
          >
            <svg
              className="footer-contact-icon"
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M2 6.5A2.5 2.5 0 0 1 4.5 4h15A2.5 2.5 0 0 1 22 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 17.5v-11zm2.2-.5 7.3 5.4a.8.8 0 0 0 .96 0L19.8 6H4.2z" />
            </svg>
            contacto@agro-market.app
          </a>

          <a href="tel:+573127658412" className="footer-contact-item">
            <svg
              className="footer-contact-icon"
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.4 21 3 13.6 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z" />
            </svg>
            +57 312 765 8412
          </a>

          <div className="footer-social">
            {/* Facebook — redirige al perfil oficial de ASAFRUT en Facebook */}
            <a
              href="https://www.facebook.com/asafrut"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook de ASAFRUT"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-1.11 9-5.53 9-10.95z" />
              </svg>
            </a>
            {/* Instagram — redirige al perfil oficial de ASAFRUT en Instagram */}
            <a
              href="https://www.instagram.com/asafrut"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de ASAFRUT"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
              </svg>
            </a>
            {/* WhatsApp — número de contacto de AgroMarket */}
            <a
              href="https://wa.me/573127658412?text=Hola%2C+necesito+ayuda+con+AgroMarket"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp de Soporte"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Fila 2: Sello de seguridad + métodos de pago */}
      <div className="footer-payments">
        <div className="footer-secure">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2 4 5v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11V5l-8-3zm-1.2 14-3.3-3.3 1.4-1.4 1.9 1.9 4.9-4.9 1.4 1.4-6.3 6.3z" />
          </svg>
          Pago 100% seguro
        </div>
        <span>Métodos de pago aceptados:</span>
        <div className="payment-logos">
          <img
            src="/payments/visa.svg"
            alt="Visa"
            className="payment-badge visa"
          />
          <img
            src="/payments/mastercard.svg"
            alt="Mastercard"
            className="payment-badge mc"
          />
          <img
            src="/payments/mercadopago.svg"
            alt="Mercado Pago"
            className="payment-badge mercadopago"
          />
          <img
            src="/payments/pse.svg"
            alt="PSE"
            className="payment-badge pse"
          />
          <img
            src="/payments/nequi.svg"
            alt="Nequi"
            className="payment-badge nequi"
          />
          <img
            src="/payments/daviplata.svg"
            alt="Daviplata"
            className="payment-badge daviplata"
          />
        </div>
      </div>

      {/* Fila 3: Bottom bar */}
      <div className="footer-bottom">
        <span>
          © {year} AgroMarket · ASAFRUT · Todos los derechos reservados ·
          Desarrollado por Deyner Chaverra
        </span>
        <div className="footer-bottom-links">
          <Link to="/terminos">Términos</Link>
          <Link to="/privacidad">Privacidad</Link>
          <Link to="/cookies">Cookies</Link>
          <button type="button" className="back-to-top" onClick={scrollToTop}>
            Volver arriba ↑
          </button>
        </div>
      </div>
    </footer>
  );
}


