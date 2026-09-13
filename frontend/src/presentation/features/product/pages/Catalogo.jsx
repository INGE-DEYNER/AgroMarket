import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PublicLayout from "@/presentation/shared/components/PublicLayout";
import ProductCard from "@/presentation/features/product/components/ProductCard";
import { useCart } from "@/presentation/features/order/hooks/useCart";
import { useDivisa } from "@/app/hooks/useDivisa";
import api from "@/infrastructure/http/api";
import "@/presentation/styles/catalogo.css";

function extractArray(response) {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function productPrice(p) {
  return Number(p.precio ?? p.price ?? 0);
}
function producerName(p) {
  return (
    p.productorNombre ??
    p.productor?.nombre ??
    p.nombreProductor ??
    p.producer?.name ??
    ""
  );
}
function producerLocation(p) {
  return p.ubicacion ?? p.ciudad ?? p.productor?.ubicacion ?? "";
}

const SORT_OPTIONS = [
  { value: "relevancia", labelKey: "catalog.sort.relevance" },
  { value: "precioAsc", labelKey: "catalog.sort.priceAsc" },
  { value: "precioDesc", labelKey: "catalog.sort.priceDesc" },
  { value: "nombreAsc", labelKey: "catalog.sort.nameAsc" },
];

export default function Catalogo() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { formatearPrecio, divisaActual } = useDivisa();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "relevancia");
  const [priceMax, setPriceMax] = useState(500000);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      api.get("/productos?page=0&size=100"),
      api.get("/productos/categorias"),
    ])
      .then(([productsRes, categoriesRes]) => {
        if (!active) return;
        setProducts(extractArray(productsRes));
        setCategories(extractArray(categoriesRes));
      })
      .catch((err) => console.error("No se pudo cargar el catálogo:", err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const selectedCategory = searchParams.get("categoria") || "";

  const setCategoria = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (!cat || selectedCategory.toLowerCase() === cat.toLowerCase()) {
      params.delete("categoria");
    } else {
      params.set("categoria", cat);
    }
    setSearchParams(params);
  };

  const visible = useMemo(() => {
    const productNameOf = (p) => p.nombre ?? p.name ?? t("catalog.productFallback", "Producto");
    const productCategoryOf = (p) => p.categoria ?? p.tipo ?? p.category ?? p.fruitType ?? "";
    const isMaracuyaValue = (v) => {
      const n = String(v || "").toLowerCase();
      return n.includes("maracuy") || n.includes("passion");
    };
    let list = products.filter((p) => {
      const text = `${productNameOf(p)} ${producerName(p)} ${productCategoryOf(p)}`.toLowerCase();
      const matchesQuery = !query.trim() || text.includes(query.trim().toLowerCase());
      // REGLA ASAFRUT: solo opera Maracuyá. Si el usuario pide otra
      // categoría (URL vieja / filtro), se muestra vacío con el aviso
      // "Próximamente" en vez de productos de otras frutas.
      const matchesCategory =
        !selectedCategory ||
        (!isMaracuyaValue(selectedCategory)
          ? false
          : productCategoryOf(p).toLowerCase() === selectedCategory.toLowerCase() ||
            isMaracuyaValue(productCategoryOf(p)));
      const matchesPrice = productPrice(p) <= priceMax;
      return matchesQuery && matchesCategory && matchesPrice;
    });

    const locale = String(i18n.resolvedLanguage || i18n.language || "es");
    switch (sort) {
      case "precioAsc":
        list = [...list].sort((a, b) => productPrice(a) - productPrice(b));
        break;
      case "precioDesc":
        list = [...list].sort((a, b) => productPrice(b) - productPrice(a));
        break;
      case "nombreAsc":
        list = [...list].sort((a, b) => productNameOf(a).localeCompare(productNameOf(b), locale));
        break;
      default:
        break;
    }
    // expone helpers para el render sin romper el scope
    list.productNameOf = productNameOf;
    list.productCategoryOf = productCategoryOf;
    return list;
  }, [products, query, selectedCategory, priceMax, sort, t, i18n.language, i18n.resolvedLanguage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (query.trim()) params.set("search", query.trim());
    else params.delete("search");
    setSearchParams(params);
  };

  return (
    <PublicLayout>
      <div className="catalog-page">
        <div className="catalog-container">
          {/* ─── HERO ─── */}
          <div className="catalog-hero">
            <div className="catalog-hero-text">
              <span className="catalog-hero-badge">
                🌱 {t("catalog.badge", "Directo del campo de Urabá")}
              </span>
              <h1 className="catalog-hero-title">
                {t("catalog.title", "Catálogo de productos")}
              </h1>
              <p>
                {t(
                  "catalog.subtitle",
                  "Frutas, verduras y productos frescos, directo de productores locales.",
                )}
              </p>
            </div>
            <span className="catalog-hero-emoji" aria-hidden="true">
              🥑
            </span>
          </div>

          <button
            type="button"
            className="btn-toggle-filters-mobile"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6 }}>
              <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
            </svg>
            {t("catalog.filters", "Filtros")}
          </button>

          <div className="catalog-layout-grid">
            {/* ─── SIDEBAR DE FILTROS ─── */}
            <aside className={`catalog-filters-sidebar${filtersOpen ? " open" : ""}`}>
              <button
                type="button"
                className="close-filters-mobile-btn"
                onClick={() => setFiltersOpen(false)}
                aria-label={t("catalog.closeFilters", "Cerrar filtros")}
              >
                ✕
              </button>

              <h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6 }}>
                  <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
                </svg>
                {t("catalog.categories", "Categorías")}
              </h3>
              <div className="catalog-filter-group">
                <label>
                  <input
                    type="checkbox"
                    checked={!selectedCategory}
                    onChange={() => setCategoria("")}
                  />
                  {t("catalog.allCategories", "Todas las categorías")}
                </label>
                {/* REGLA ASAFRUT: solo Maracuyá habilitada. */}
                <label>
                  <input
                    type="checkbox"
                    checked={
                      selectedCategory.toLowerCase().includes("maracuy") ||
                      selectedCategory.toLowerCase().includes("passion")
                    }
                    onChange={() => setCategoria("Maracuyá")}
                  />
                  {t("catalog.maracuyaOnly", "Maracuyá")}
                </label>
                {[
                  "Banano",
                  "Mango",
                  "Piña",
                  "Guanábana",
                  "Naranja",
                  "Coco",
                  "Limón",
                  "Otro",
                ].map((value) => (
                  <label
                    key={value}
                    style={{ opacity: 0.55, cursor: "not-allowed" }}
                    title={t("catalog.comingSoon", "Próximamente")}
                  >
                    <input type="checkbox" checked={false} disabled />
                    {value}{" "}
                    <span style={{ fontSize: "0.7rem" }}>
                      ({t("catalog.comingSoon", "Próximamente")})
                    </span>
                  </label>
                ))}
              </div>

              <h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6 }}>
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                </svg>
                {t("catalog.price", "Precio máximo")}
              </h3>
              <div className="catalog-filter-group">
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="5000"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  {t("catalog.upTo", "Hasta:")} {formatearPrecio(priceMax)} · {divisaActual}
                </div>
              </div>
            </aside>

            {/* ─── PRODUCTOS ─── */}
            <section>
              <div className="catalog-meta-row">
                <form className="catalog-search-inline" onSubmit={handleSearchSubmit}>
                  <input
                    className="search-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("catalog.searchPlaceholder", "Buscar productos…")}
                    aria-label={t("catalog.searchAria", "Buscar productos")}
                  />
                </form>
                <div className="catalog-meta-count">
                  {loading ? (
                    t("catalog.loading", "Cargando…")
                  ) : (
                    <>
                      <strong>{visible.length}</strong>{" "}
                      {t("catalog.resultsFound", "productos encontrados")}
                    </>
                  )}
                </div>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label={t("catalog.sortBy", "Ordenar por")}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.labelKey, opt.value)}
                    </option>
                  ))}
                </select>
              </div>

              {loading ? (
                <div className="catalog-grid">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="catalog-card catalog-skeleton" />
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <div className="catalog-empty-state">
                  <span style={{ fontSize: "2.5rem" }}>🔍</span>
                  <h3>{t("catalog.noProducts", "No encontramos productos con los criterios seleccionados.")}</h3>
                  <p>{t("catalog.tryAgain", "Prueba ajustando los filtros o la búsqueda.")}</p>
                </div>
              ) : (
                <div className="catalog-grid">
                  {visible.map((p) => {
                    const nombre = p.nombre ?? p.name ?? t("catalog.productFallback", "Producto");
                    const categoria = p.categoria ?? p.tipo ?? p.category ?? p.fruitType ?? "";
                    const prodName = p.productorNombre ?? p.producer?.name ?? producerName(p) ?? "";
                    return (
                    <ProductCard
                      key={p.id ?? p.idEncriptado ?? `${nombre}-${prodName}`}
                      p={{
                        ...p,
                        nombre,
                        precio: productPrice(p),
                        tipoFruta: p.fruitType ?? categoria,
                        productorNombre: prodName || t("catalog.registeredProducer", "Productor registrado"),
                        ubicacion: producerLocation(p),
                        imagenUrl: p.imageUrl || p.imagenUrl || null,
                        stock: p.availableQuantity ?? p.stock ?? 0,
                        calificacion: p.averageRating > 0 ? p.averageRating.toFixed(1) : null,
                      }}
                      t={t}
                      addedStates={{}}
                      handlePedirAhora={addToCart}
                      onViewDetails={(prod) => navigate(`/producto/${prod.id ?? ""}`)}
                      onContactProducer={() => navigate("/mensajeria")}
                    />
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
