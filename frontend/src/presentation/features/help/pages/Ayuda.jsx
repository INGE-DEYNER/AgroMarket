import { useState } from "react";
import PublicLayout from "@/presentation/shared/components/PublicLayout";
import { useTranslation } from "react-i18next";
import "@/presentation/styles/public-views.css";

const FAQS = [
  {
    q: "ayuda.faq1.q",
    a: "ayuda.faq1.a",
  },
  {
    q: "ayuda.faq2.q",
    a: "ayuda.faq2.a",
  },
  {
    q: "ayuda.faq3.q",
    a: "ayuda.faq3.a",
  },
  {
    q: "ayuda.faq4.q",
    a: "ayuda.faq4.a",
  },
  {
    q: "ayuda.faq5.q",
    a: "ayuda.faq5.a",
  },
];

export default function Ayuda() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(null);
  const [query, setQuery] = useState("");

  const filtered = FAQS.filter(
    (f) =>
      !query ||
      t(f.q).toLowerCase().includes(query.toLowerCase()) ||
      t(f.a).toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <PublicLayout>
      <div className="ay-page">
        {/* Migas de pan */}
        <nav className="ay-breadcrumb" aria-label={t("ayuda.breadcrumb", "Migas de pan")}>
          <span>{t("ayuda.home", "Inicio")}</span>
          <span aria-hidden="true">›</span>
          <strong>{t("ayuda.help", "Ayuda")}</strong>
        </nav>

        {/* Banner de búsqueda (frame: search-box-help) */}
        <section className="ay-hero">
          <h1>{t("ayuda.title", "¿En qué podemos ayudarte hoy?")}</h1>
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
              placeholder={t("ayuda.searchPlaceholder", "Busca respuestas a tus preguntas...")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t("ayuda.searchAria", "Buscar en ayuda")}
            />
          </div>
        </section>

        {/* Contenido principal */}
        <section className="ay-content">
          <div className="ay-faqs">
            <h2>{t("ayuda.frequentTopics", "Temas Frecuentes")}</h2>
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
                    <span>{t(f.q)}</span>
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
                  {isOpen && <p className="ay-faq-body">{t(f.a)}</p>}
                </article>
              );
            })}
            {filtered.length === 0 && (
              <p className="ay-empty">
                {t("ayuda.noResults", "No encontramos resultados para tu búsqueda.")}
              </p>
            )}
          </div>

          {/* Tarjeta de contacto (frame: sidebar) */}
          <aside className="ay-contact" id="contacto">
            <h2>{t("ayuda.contactTitle", "¿No encontraste lo que buscabas?")}</h2>
            <p>
              {t("ayuda.contactText", "Nuestro equipo de soporte al productor y cliente local está listo para atenderte directamente por chat.")}
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
                  <small>{t("ayuda.whatsapp247", "WhatsApp 24/7")}</small>
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
                  <small>{t("ayuda.email", "Correo electrónico")}</small>
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
              {t("ayuda.talkToSupport", "Hablar con Soporte por WhatsApp")}
            </a>
          </aside>
        </section>
      </div>
    </PublicLayout>
  );
}
