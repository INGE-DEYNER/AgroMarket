import { useState } from "react";
import PublicLayout from "@/presentation/shared/components/PublicLayout";
import "@/presentation/styles/public-views.css";

const FAQS = [
  {
    q: "¿Cómo realizo mi compra en la plataforma?",
    a: "Es muy sencillo: explora la tienda, selecciona las frutas o tubérculos preferidos, indícanos cuántos kilos necesitas, ingresa tus datos de envío y realiza el pago seguro en línea.",
  },
  {
    q: "¿Cuáles son los métodos de pago aceptados?",
    a: "Aceptamos transferencias por PSE, tarjetas de crédito (Visa, Mastercard, American Express), y aplicaciones de billetera digital móvil colombianas.",
  },
  {
    q: "¿Cuánto tiempo tarda en llegar mi pedido?",
    a: "Los pedidos se coordinan directamente para cosecharse en la mañana. Tardamos entre 24 y 48 horas en despachar y entregar en tu puerta para mantener la frescura garantizada.",
  },
  {
    q: "¿Cómo puedo unirme si soy productor de Urabá?",
    a: "Puedes comunicarte con la asociación Asafrut a través de nuestro soporte técnico en WhatsApp o diligenciar el formulario en la pestaña de productores. Te ayudaremos con la verificación física de tu finca.",
  },
  {
    q: "¿Cómo funcionan las políticas de devoluciones?",
    a: "Si un lote de frutas o vegetales no llega en la frescura óptima acordada, puedes enviarnos una foto al chat de soporte en las primeras 12 horas del recibo y realizaremos la reposición sin costos adicionales.",
  },
];

export default function Ayuda() {
  const [open, setOpen] = useState(null);
  const [query, setQuery] = useState("");

  const filtered = FAQS.filter(
    (f) =>
      !query ||
      f.q.toLowerCase().includes(query.toLowerCase()) ||
      f.a.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <PublicLayout>
      <div className="ay-page">
        {/* Migas de pan */}
        <nav className="ay-breadcrumb" aria-label="Migas de pan">
          <span>Inicio</span>
          <span aria-hidden="true">›</span>
          <strong>Ayuda</strong>
        </nav>

        {/* Banner de búsqueda (frame: search-box-help) */}
        <section className="ay-hero">
          <h1>¿En qué podemos ayudarte hoy?</h1>
          <div className="ay-search-wrap">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#626C66"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Busca respuestas a tus preguntas..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar en ayuda"
            />
          </div>
        </section>

        {/* Contenido principal */}
        <section className="ay-content">
          <div className="ay-faqs">
            <h2>Temas Frecuentes</h2>
            {filtered.map((f) => {
              const index = FAQS.indexOf(f);
              const isOpen = open === index;
              return (
                <article className="ay-faq" key={f.q}>
                  <button
                    type="button"
                    className="ay-faq-head"
                    onClick={() => setOpen(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span>{f.q}</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="#18201A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "none",
                        transition: "transform 200ms ease",
                        flexShrink: 0,
                      }}
                      aria-hidden="true"
                    >
                      <path d="M3 5l4 4 4-4" />
                    </svg>
                  </button>
                  {isOpen && <p className="ay-faq-body">{f.a}</p>}
                </article>
              );
            })}
            {filtered.length === 0 && (
              <p className="ay-empty">
                No encontramos resultados para tu búsqueda.
              </p>
            )}
          </div>

          {/* Tarjeta de contacto (frame: sidebar) */}
          <aside className="ay-contact" id="contacto">
            <h2>¿No encontraste lo que buscabas?</h2>
            <p>
              Nuestro equipo de soporte al productor y cliente local está listo
              para atenderte directamente por chat.
            </p>
            <hr className="ay-divider" />
            <div className="ay-contact-list">
              <div className="ay-contact-row">
                <span className="ay-contact-icon ay-contact-icon--wa">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1A5C2A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </span>
                <div>
                  <small>WhatsApp 24/7</small>
                  <strong>+57 300 123 4567</strong>
                </div>
              </div>
              <div className="ay-contact-row">
                <span className="ay-contact-icon ay-contact-icon--mail">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1A5C2A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 6l-10 7L2 6" />
                  </svg>
                </span>
                <div>
                  <small>Correo electrónico</small>
                  <strong>soporte@agromarket.co</strong>
                </div>
              </div>
            </div>
            <a
              className="ay-whatsapp-btn"
              href="https://wa.me/573001234567"
              target="_blank"
              rel="noreferrer"
            >
              Hablar con Soporte por WhatsApp
            </a>
          </aside>
        </section>
      </div>
    </PublicLayout>
  );
}
