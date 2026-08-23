import { Link } from "react-router-dom";
import PublicLayout from "@/presentation/shared/components/PublicLayout";
import whySupportImg from "@/assets/why-support.png";
import "@/presentation/styles/public-views.css";

const STEPS = [
  {
    num: "01",
    title: "Explora y Descubre",
    text: "Navega por nuestro catálogo de frutas, verduras, tubérculos y delicias cultivadas directamente en el Urabá colombiano.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Elige tu Cosecha",
    text: "Selecciona las cantidades deseadas. Verás exactamente qué finca cosechó cada producto y a qué precio justo sugieren.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Compra con Confianza",
    text: "Realiza tu pago 100% seguro a través de múltiples opciones de manera rápida y sin complicaciones.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Recibe en tu Hogar",
    text: "Nuestra red de logística campesina recolecta el producto fresco del día y lo entrega directamente en tu puerta.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
];

export default function ComoFunciona() {
  return (
    <PublicLayout>
      <div className="cf-page">
        {/* Encabezado centrado (frame: content-header) */}
        <section className="cf-header">
          <span className="cf-badge">Proceso simple y transparente</span>
          <h1>¿Cómo funciona AgroMarket?</h1>
          <p>
            Comprar los productos más frescos del campo colombiano es ahora una
            realidad sencilla, directa y sin intermediarios perjudiciales.
          </p>
        </section>

        {/* Pasos (frame: steps-container) */}
        <section className="cf-steps">
          {STEPS.map((s) => (
            <article className="cf-step-card" key={s.num}>
              <div className="cf-step-head">
                <span className="cf-step-icon">{s.icon}</span>
                <span className="cf-step-num">{s.num}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </section>

        {/* Por qué apoyar (frame: why-support) */}
        <section className="cf-why">
          <img
            className="cf-why-img"
            src={whySupportImg}
            alt="Productores colombianos en el campo"
            loading="lazy"
          />
          <div className="cf-why-content">
            <h2>Apoyamos lo local y devolvemos el valor al campo</h2>
            <p>
              Tradicionalmente, los intermediarios agrícolas retienen hasta el
              70% del valor de un producto, dejando a nuestros campesinos con
              pérdidas.
            </p>
            <p>
              En AgroMarket, el <strong>100% de la venta va directo</strong> a
              las asociaciones locales de productores. Al comprar aquí, estás
              permitiendo que las familias de Urabá sigan cultivando sus tierras
              con condiciones de vida dignas, educación y desarrollo regional.
            </p>
            <Link to="/catalogo" className="cf-cta">
              Empezar a comprar
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
