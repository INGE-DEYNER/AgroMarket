import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Función para abrir el chatbot de soporte flotante
function openChatbot() {
  // El chatbot está montado globalmente; dispara un click en el trigger
  const trigger = document.querySelector(".chatbot-trigger");
  if (trigger) trigger.click();
}

export default function Footer() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <footer className="footer-pro">
      {/* Fila 1: Links principales */}
      <div className="footer-main">
        <div className="footer-col">
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
        </div>

        <div className="footer-col">
          <h4>Plataforma</h4>
          <Link to="/catalogo">Catálogo de productos</Link>
          <Link to="/como-funciona">Cómo funciona</Link>
          <Link to="/sobre-asafrut">Sobre ASAFRUT</Link>
          <Link to="/productores">Nuestros productores</Link>
          <Link to="/home#testimonios">Testimonios</Link>
        </div>

        <div className="footer-col">
          <h4>Acceso</h4>
          <Link to="/login">Iniciar sesión</Link>
          <Link to="/registro">Registrarse gratis</Link>
          <Link to="/registro?rol=PRODUCTOR">Soy productor</Link>
          <Link to="/registro?rol=EMPRESA">Soy empresa / frutería</Link>
        </div>

        <div className="footer-col">
          <h4>Soporte</h4>
          <Link to="/ayuda">Centro de ayuda</Link>
          {/* Reportar problema: abre el chatbot para reportar */}
          <button
            type="button"
            onClick={openChatbot}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "inherit",
              textDecoration: "none",
              fontSize: "inherit",
              textAlign: "left",
            }}
          >
            Reportar problema
          </button>
          <Link to="/terminos">Términos de uso</Link>
          <Link to="/privacidad">Política de privacidad</Link>
          <Link to="/cookies">Política de cookies</Link>
        </div>

        <div className="footer-col">
          <h4>Contacto</h4>
          <span>Chigorodó, Antioquia</span>
          <a href="mailto:contacto@agro-market.app">contacto@agro-market.app</a>
          <a href="tel:+573127658412">+57 312 765 8412</a>
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

      {/* Fila 2: Métodos de pago */}
      <div className="footer-payments">
        <span>Métodos de pago aceptados:</span>
        <div className="payment-logos">
          <span className="payment-badge visa">VISA</span>
          <span className="payment-badge mc">Mastercard</span>
          <span className="payment-badge pse">PSE</span>
          <span className="payment-badge nequi">Nequi</span>
          <span className="payment-badge daviplata">Daviplata</span>
        </div>
      </div>

      {/* Fila 3: Bottom bar */}
      <div className="footer-bottom">
        <span>© 2026 AgroMarket · ASAFRUT · Todos los derechos reservados</span>
        <div className="footer-bottom-links">
          <Link to="/terminos">Términos</Link>
          <Link to="/privacidad">Privacidad</Link>
          <Link to="/cookies">Cookies</Link>
        </div>
        <span>
          Hecho con{" "}
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="#ef4444"
            style={{
              display: "inline",
              verticalAlign: "middle",
              margin: "0 2px",
            }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>{" "}
          en Colombia · Desarrollado por Deyner Chaverra
        </span>
      </div>
    </footer>
  );
}
