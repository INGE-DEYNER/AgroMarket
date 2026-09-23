import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicLayout from "@/presentation/shared/components/PublicLayout";
import { useCart } from "@/presentation/features/order/hooks/useCart";
import api from "@/infrastructure/http/api";
import heroImg from "@/assets/home/home-hero.png";
import catFrutasImg from "@/assets/home/cat-frutas-verduras.png";
import catPlatanosImg from "@/assets/home/cat-platanos-banano.png";
import catTuberculosImg from "@/assets/home/cat-tuberculos-raices.png";
import catCacaoImg from "@/assets/home/cat-cacao-cafe.png";
import catProcesadosImg from "@/assets/home/cat-procesados.png";
import catFloresImg from "@/assets/home/cat-flores-plantas.png";
import handHeartIcon from "@/assets/icon-hand-heart.svg";
import "@/presentation/styles/public-views.css";
import { useTranslation } from "react-i18next";
import { useDivisa } from "@/app/hooks/useDivisa";
import Icon from "@/presentation/shared/components/Icon";

const getTrustBadges = (t) => [
  {
    title: t("home.trust.secureTitle", "Compra 100% Segura"),
    text: t("home.trust.secureText", "<Trans1></Trans1>acciones protegidas"),
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
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
    title: t("home.trust.expressTitle", "Envíos Express"),
    text: t("home.trust.expressText", "Directo a tu domicilio"),
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
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
  {
    title: t("home.trust.freshTitle", "Frescura Garantizada"),
    text: t("home.trust.freshText", "Cosechados en el día"),
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
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
    title: t("home.trust.localTitle", "Apoyo Directo Local"),
    text: t("home.trust.localText", "Sin intermediarios dañinos"),
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: t("home.trust.supportTitle", "Soporte Amigable"),
    text: t("home.trust.supportText", "Atención WhatsApp 24/7"),
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
];

/*
 * REGLA DE NEGOCIO (ASAFRUT): por ahora solo opera la categoría MARACUYÁ.
 * Las demás categorías se muestran como "Próximamente" (deshabilitadas).
 */
const COMING_SOON_CATEGORY_NAMES = [
  "Frutas y Verduras",
  "Plátanos y Banano",
  "Tubérculos y Raíces",
  "Cacao y Café",
  "Productos Procesados",
  "Flores y Plantas",
  "Banano",
  "Mango",
  "Piña",
  "Guanábana",
  "Naranja",
  "Coco",
  "Limón",
  "Otro",
];

export function isMaracuyaCategoryName(name) {
  const n = String(name || "").toLowerCase();
  return (
    n.includes("maracuy") || n.includes("passion") || n.includes("maracuyá")
  );
}

const getCategories = (t) => [
  {
    name: t("home.categories.passionFruit", "Maracuyá"),
    img: catFrutasImg,
    slug: "Maracuyá",
    active: true,
  },
  {
    name: t("home.categories.bananas", "Plátanos y Banano"),
    img: catPlatanosImg,
    slug: "Plátanos y Banano",
    active: false,
  },
  {
    name: t("home.categories.roots", "Tubérculos y Raíces"),
    img: catTuberculosImg,
    slug: "Tubérculos y Raíces",
    active: false,
  },
  {
    name: t("home.categories.coffee", "Cacao y Café"),
    img: catCacaoImg,
    slug: "Cacao y Café",
    active: false,
  },
  {
    name: t("home.categories.processed", "Productos Procesados"),
    img: catProcesadosImg,
    slug: "Productos Procesados",
    active: false,
  },
  {
    name: t("home.categories.flowers", "Flores y Plantas"),
    img: catFloresImg,
    slug: "Flores y Plantas",
    active: false,
  },
];

export { COMING_SOON_CATEGORY_NAMES };

function extractArray(response) {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

export default function Home() {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { formatearPrecio, divisaActual } = useDivisa();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  // Newsletter: estado del formulario "Suscríbete".
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState({ type: "", text: "" });
  const [newsletterSending, setNewsletterSending] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterMsg({
        type: "error",
        text: t("home.newsletter.invalid", "Ingresa un correo válido."),
      });
      return;
    }
    setNewsletterSending(true);
    setNewsletterMsg({ type: "", text: "" });
    try {
      const res = await api.post("/newsletter/subscribe", {
        email,
        origen: "home",
      });
      const data = res?.data ?? res;
      setNewsletterMsg({
        type: "ok",
        text:
          data?.message ||
          t(
            "home.newsletter.done",
            "¡Listo! Te llegará el primer correo pronto.",
          ),
      });
      setNewsletterEmail("");
    } catch (err) {
      setNewsletterMsg({
        type: "error",
        text:
          err?.response?.data?.message ||
          err?.message ||
          t("home.newsletter.error", "No se pudo suscribir. Intenta de nuevo."),
      });
    } finally {
      setNewsletterSending(false);
    }
  };

  useEffect(() => {
    let active = true;

    api
      .get("/productos/categorias")
      .then((res) => {
        if (!active) return;
        setCategories(extractArray(res));
      })
      .catch((error) => {
        console.error(
          "No se pudo cargar la información pública del inicio:",
          error,
        );
      })
      .finally(() => {
        if (active) setLoadingCategories(false);
      });

    api
      .get("/productos?page=0&size=4")
      .then((res) => {
        if (!active) return;
        setFeaturedProducts(extractArray(res).slice(0, 4));
      })
      .catch((err) =>
        console.error("No se pudieron cargar productos destacados:", err),
      )
      .finally(() => {
        if (active) setLoadingProducts(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const categoryCards = useMemo(() => {
    // Regla ASAFRUT: solo Maracuyá está habilitada. Siempre mostramos las
    // 6 tarjetas, pero las no habilitadas van como "Próximamente".
    return getCategories(t);
  }, [t]);

  const trustBadges = getTrustBadges(t);

  return (
    <PublicLayout>
      <div className="hm-page">
        {/* Hero (frame: hero-section) */}
        <section
          className="hm-hero"
          style={{ backgroundImage: `url(${heroImg})` }}
        >
          <div className="hm-hero-overlay">
            <span className="hm-hero-badge">
              {t("home.hero.badge", "DIRECTO DEL PRODUCTOR A TU CASA")}
            </span>
            <h1>
              {t(
                "home.hero.title",
                "Del campo de Urabá y de toda Colombia a tu mesa",
              )}
            </h1>
            <p>
              {t(
                "home.hero.description",
                "Apoya al campo colombiano comprando frutas, verduras, tubérculos y café cultivados con pasión por productores locales. Entrega rápida y garantizada.",
              )}
            </p>
            <div className="hm-hero-btns">
              <Link className="hm-btn-primary" to="/catalogo">
                {t("home.hero.buyNow", "Comprar ahora")}
              </Link>
              <Link className="hm-btn-outline" to="/como-funciona">
                {t("home.hero.howItWorks", "Cómo funciona")}
              </Link>
            </div>
          </div>
        </section>

        {/* Trust badges (frame: trust-badges) */}
        <section className="hm-trust">
          {trustBadges.map((b) => (
            <div className="hm-trust-item" key={b.title}>
              <span className="hm-trust-icon">{b.icon}</span>
              <div>
                <strong>{b.title}</strong>
                <span>{b.text}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Featured categories (frame: featured-categories) */}
        <section className="hm-categories">
          <div className="hm-section-head">
            <div>
              <h2>{t("home.categories.title", "Categorías Destacadas")}</h2>
              <p>
                {t(
                  "home.categories.subtitle",
                  "Explora los tesoros más frescos de nuestra tierra colombiana",
                )}
              </p>
            </div>
            <Link to="/catalogo">
              {t("home.categories.viewAll", "Ver todas las categorías")} <Icon name="arrowRight" size={15} />
            </Link>
          </div>

          {loadingCategories ? (
            <div className="hm-loading">
              {t("home.categories.loading", "Cargando categorías...")}
            </div>
          ) : (
            <div className="hm-cat-grid">
              {categoryCards.map((cat) =>
                cat.active ? (
                  <Link
                    className="hm-cat-item"
                    key={cat.name}
                    to={`/catalogo?categoria=${encodeURIComponent(cat.slug || cat.name)}`}
                  >
                    <span className="hm-cat-circle">
                      <img src={cat.img} alt={cat.name} loading="lazy" />
                    </span>
                    <span className="hm-cat-name">{cat.name}</span>
                  </Link>
                ) : (
                  <div
                    className="hm-cat-item hm-cat-coming"
                    key={cat.name}
                    aria-disabled="true"
                    title={t("home.categories.comingSoon", "Próximamente")}
                    style={{ cursor: "not-allowed", opacity: 0.75 }}
                  >
                    <span
                      className="hm-cat-circle"
                      style={{ position: "relative", filter: "grayscale(35%)" }}
                    >
                      <img src={cat.img} alt={cat.name} loading="lazy" />
                      <span
                        style={{
                          position: "absolute",
                          top: "6px",
                          right: "6px",
                          background: "#14532d",
                          color: "#fff",
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: "999px",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {t("home.categories.comingSoon", "Próximamente")}
                      </span>
                    </span>
                    <span className="hm-cat-name">{cat.name}</span>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        {/* Local farmers banner (frame: local-farmers-banner) */}
        <section className="hm-farmers">
          <div className="hm-farmers-left">
            <span className="hm-farmers-icon">
              <img src={handHeartIcon} alt="" width="32" height="32" />
            </span>
            <div>
              <h2>
                {t(
                  "home.farmers.title",
                  "Apoyo real a nuestros campesinos colombianos",
                )}
              </h2>
              <p>
                {t(
                  "home.farmers.description",
                  "El 100% de tu compra va directamente a la asociación de campesinos. Pagos justos y transparentes.",
                )}
              </p>
            </div>
          </div>
          <Link className="hm-farmers-btn" to="/productores">
            {t("home.farmers.button", "Conoce a los Productores")}
          </Link>
        </section>

        {/* Recommended products (frame: recommended-products) */}
        <section className="hm-products">
          <div className="hm-section-head">
            <div>
              <h2>{t("home.products.title", "Cosecha Fresca de la Semana")}</h2>
              <p>
                {t(
                  "home.products.subtitle",
                  "Los productos más recientes de nuestros productores",
                )}
              </p>
            </div>
            <Link to="/catalogo">
              {t("home.products.viewAll", "Ver catálogo completo →")}
            </Link>
          </div>

          {loadingProducts ? (
            <div className="hm-loading">
              {t("home.products.loading", "Cargando productos...")}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="hm-loading" style={{ color: "var(--text-dim)" }}>
              {t("home.products.empty", "Aún no hay productos registrados.")}{" "}
              <Link to="/catalogo">
                {t("home.products.explore", "Explorar catálogo →")}
              </Link>
            </div>
          ) : (
            <div className="hm-product-grid">
              {featuredProducts.map((p) => {
                const price = Number(p.price ?? p.precio ?? 0);
                const formattedPrice = formatearPrecio(price);
                const producerName = p.producer?.name ?? "Productor ASAFRUT";
                return (
                  <article
                    className="hm-product-card"
                    key={p.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/producto/${p.id}`)}
                  >
                    {p.imageUrl ? (
                      <img
                        className="hm-product-img"
                        src={p.imageUrl}
                        alt={p.name}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="hm-product-img"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "4rem",
                          background: "var(--card-bg, #1e1e1e)",
                        }}
                      >
                        🌿
                      </div>
                    )}
                    <div className="hm-product-body">
                      <div className="hm-product-head">
                        <span className="hm-product-producer">
                          {producerName}
                        </span>
                      </div>
                      <h3>{p.name}</h3>
                      <span className="hm-product-presentation">
                        {t("home.products.presentation", "Presentación: Kg")}
                      </span>
                      {p.averageRating > 0 && (
                        <div className="hm-product-rating">
                          <span className="hm-stars" aria-hidden="true">
                            ★★★★★
                          </span>
                          <span className="hm-score">
                            ({p.averageRating.toFixed(1)})
                          </span>
                        </div>
                      )}
                      <div className="hm-product-foot">
                        <div>
                          <strong className="hm-price">{formattedPrice}</strong>
                          <span className="hm-price-label">
                            {t(
                              "home.products.priceLabel",
                              "Precio {{currency}} / kg",
                              { currency: divisaActual },
                            )}
                          </span>
                        </div>
                        <button
                          className="hm-add-btn"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart({
                              ...p,
                              nombre: p.name,
                              precio: price,
                              imagenUrl: p.imageUrl,
                            });
                          }}
                        >
                          {t("home.products.add", "Agregar")}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Newsletter (frame: newsletter) */}
        <section className="hm-newsletter">
          <div className="hm-newsletter-text">
            <h2>
              {t(
                "home.newsletter.title",
                "Suscríbete a nuestra cosecha semanal",
              )}
            </h2>
            <p>
              {t(
                "home.newsletter.description",
                "Recibe ofertas exclusivas, novedades y recetas directo de los campesinos colombianos.",
              )}
            </p>
          </div>
          <form
            className="hm-newsletter-form"
            onSubmit={handleNewsletterSubmit}
          >
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder={t(
                "home.newsletter.placeholder",
                "Tu correo electrónico",
              )}
              aria-label={t(
                "home.newsletter.placeholder",
                "Tu correo electrónico",
              )}
              required
            />
            <button type="submit" disabled={newsletterSending}>
              {newsletterSending
                ? t("home.newsletter.sending", "Enviando…")
                : t("home.newsletter.button", "Suscribirse")}
            </button>
          </form>
          {newsletterMsg.text && (
            <p
              role="status"
              style={{
                marginTop: "8px",
                fontSize: "0.85rem",
                color: newsletterMsg.type === "ok" ? "#15803d" : "#b91c1c",
              }}
            >
              {newsletterMsg.text}
            </p>
          )}
        </section>
      </div>
    </PublicLayout>
  );
}
