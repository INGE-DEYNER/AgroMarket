import { useMemo, useState } from "react";
import SpecialSystemShell from "@/presentation/features/special/components/SpecialSystemShell";
import { useTranslation } from "react-i18next";

const CATS = [
  "special.catOrders",
  "special.catShipping",
  "special.catPayments",
  "special.catReturns",
  "special.catProducts",
  "special.catAccount",
  "special.catProducers",
  "special.catCoupons",
];

const ARTICLES = [
  ["special.articleTrack", "special.articleTrackDesc"],
  ["special.articleDelivery", "special.articleDeliveryDesc"],
  ["special.articlePayments", "special.articlePaymentsDesc"],
  ["special.articleReturn", "special.articleReturnDesc"],
];

/*
 * Centro de ayuda.
 *
 * Antes renderizaba las CLAVES de traducción tal cual: la categoría salía como
 * "special.catOrders" y el artículo como "special.articleTrack", porque se
 * imprimía `{c}` en vez de `{t(c)}`. El usuario veía identificadores internos
 * en lugar de texto. El buscador tampoco servía: comparaba la búsqueda contra
 * la clave, no contra el texto que se ve.
 *
 * Ahora cada clave pasa por t() y el filtro compara sobre lo traducido.
 */
export default function CentroAyudaDetallado() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(CATS[0]);

  const filtrado = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ARTICLES;
    return ARTICLES.filter(([titulo, desc]) =>
      (t(titulo) + " " + t(desc)).toLowerCase().includes(q),
    );
  }, [query, t]);

  return (
    <SpecialSystemShell activeKey="ayuda-detallada">
      <div className="special-heading">
        <div>
          <h1>{t("special.helpCenter", "Centro de ayuda")}</h1>
          <p>
            {t(
              "special.helpCenterSub",
              "Encuentra respuestas y guías para usar AgroMarket.",
            )}
          </p>
        </div>
      </div>

      <div className="help-search">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("special.helpSearch", "Buscar en ayuda...")}
          aria-label={t("special.helpSearch", "Buscar en ayuda")}
        />
      </div>

      <div className="help-layout">
        <aside className="help-categories">
          <h2>{t("special.helpCategories", "Categorías")}</h2>
          {CATS.map((clave) => (
            <button
              className={cat === clave ? "active" : ""}
              onClick={() => setCat(clave)}
              key={clave}
            >
              {t(clave)}
            </button>
          ))}
        </aside>

        <section className="help-articles">
          <h2>{t("special.helpPopular", "Artículos populares")}</h2>
          {filtrado.map(([titulo, desc]) => (
            <article key={titulo}>
              <h3>{t(titulo)}</h3>
              <p>{t(desc)}</p>
              <span>{t(cat)}</span>
            </article>
          ))}
          {!filtrado.length && (
            <div className="special-empty">
              {t(
                "special.helpNoResults",
                "No encontramos artículos para tu búsqueda.",
              )}
            </div>
          )}
        </section>
      </div>

      <button
        type="button"
        className="special-primary-action"
        onClick={() => setQuery("")}
      >
        {t("special.helpSeeAll", "Ver todos los artículos de ayuda")}
      </button>
    </SpecialSystemShell>
  );
}
