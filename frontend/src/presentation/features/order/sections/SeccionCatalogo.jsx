/*
 * SeccionCatalogo — sección del panel.
 *
 * Movimiento puro del JSX que estaba dentro del archivo del panel. Lo
 * único que cambia: el estado llega por contexto en vez de por el ámbito del
 * padre, y el contenedor ya no lleva la condición de activeSection porque
 * con el Outlet solo se monta la sección activa.
 */
import { useCompradorData } from "./CompradorContexto.js";
import { useTranslation } from "react-i18next";
import ProductCard from "@/presentation/features/product/components/ProductCard";

export default function SeccionCatalogo() {
  const { t } = useTranslation();
  const { CATEGORIES, addToCart, catalogFiltered, catalogLoading, catalogSearch, catalogSearchQuery, contactProductor, count, filtroTipoCatalog, maxPrice, minPrice, setCartOpen, setCatalogSearch, setCatalogSearchQuery, setFiltroTipoCatalog, setMaxPrice, setMinPrice, setSelectedProduct, setSoloPromo, soloPromo } = useCompradorData();

  return (
<div className="section" id="sec-catalogo">
          <div
            className="catalog-hero"
            style={{
              background:
                "linear-gradient(135deg, var(--primary) 0%, var(--am-green) 100%)",
              borderRadius: "16px",
              padding: "32px",
              color: "#fff",
              marginBottom: "24px",
            }}
          >
            <h1
              style={{ color: "#fff", fontSize: "2rem", marginBottom: "8px" }}
            >
              {t("catalog.heroTitle", "Frutas tropicales")}
            </h1>
            <p style={{ opacity: 0.9 }}>
              {t(
                "catalog.heroSub",
                "Productos frescos de los agricultores de ASAFRUT. Sin intermediarios, precios justos.",
              )}
            </p>
          </div>

          <div
            className="catalog-controls"
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <div
              className="search-wrapper"
              style={{ flex: 1, position: "relative" }}
            >
              <input
                className="search-input"
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 40px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-light)",
                }}
                type="text"
                placeholder={t(
                  "catalog.searchPlaceholder",
                  "Buscar productos...",
                )}
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
              />
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "12px",
                  color: "var(--text-muted)",
                }}
              ></span>
            </div>
            {count > 0 && (
              <button
                className="btn btn-primary"
                onClick={() => setCartOpen(true)}
              >
                {t("catalog.cartButton", "Carrito")} ({count})
              </button>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 280px",
              gap: "24px",
              alignItems: "flex-start",
            }}
            className="catalog-layout-grid"
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div
                className="catalog-controls"
                style={{
                  display: "flex",
                  gap: "16px",
                  flexWrap: "wrap",
                  marginBottom: "20px",
                }}
              >
                <div
                  className="search-wrapper"
                  style={{ flex: 1, position: "relative" }}
                >
                  <input
                    className="search-input"
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 40px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-light)",
                    }}
                    type="text"
                    placeholder={t(
                      "catalog.searchPlaceholder",
                      "Buscar productos...",
                    )}
                    value={catalogSearchQuery}
                    onChange={(e) => setCatalogSearchQuery(e.target.value)}
                  />
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "12px",
                      color: "var(--text-muted)",
                    }}
                  ></span>
                </div>
                {count > 0 && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setCartOpen(true)}
                  >
                    {t("catalog.cartButton", "Carrito")} ({count})
                  </button>
                )}
              </div>

              {/* CATEGORY CHIPS */}
              <div
                className="category-chips"
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "24px",
                }}
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    className={`chip${filtroTipoCatalog === cat.value ? " active" : ""}`}
                    onClick={() => setFiltroTipoCatalog(cat.value)}
                  >
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SIDE FILTER CONTROLS */}
            <div
              className="card-table"
              style={{
                padding: "20px",
                borderRadius: "var(--radius)",
                background: "var(--surface)",
              }}
            >
              <h4
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  borderBottom: "1px solid var(--border-light)",
                  paddingBottom: "8px",
                }}
              >
                Filtros
              </h4>
              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label className="form-label" style={{ fontSize: "0.75rem" }}>
                  Precio Mínimo (COP)
                </label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="$ Mín"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label className="form-label" style={{ fontSize: "0.75rem" }}>
                  Precio Máximo (COP)
                </label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="$ Máx"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "12px",
                }}
              >
                <input
                  type="checkbox"
                  id="promoToggleCatalog"
                  checked={soloPromo}
                  onChange={(e) => setSoloPromo(e.target.checked)}
                  style={{ width: "16px", height: "16px" }}
                />
                <label
                  htmlFor="promoToggleCatalog"
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  {" "}
                  Sólo Promociones
                </label>
              </div>
              {(minPrice || maxPrice || soloPromo || filtroTipoCatalog) && (
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: "100%", marginTop: "16px" }}
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                    setSoloPromo(false);
                    setFiltroTipoCatalog("");
                    setCatalogSearchQuery("");
                  }}
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* PRODUCT GRID */}
          <div className="catalog-grid">
            {catalogLoading ? (
              <div
                style={{
                  padding: "48px",
                  textAlign: "center",
                  gridColumn: "1 / -1",
                }}
              >
                {t("catalog.loading", "Cargando catálogo...")}
              </div>
            ) : catalogFiltered.length === 0 ? (
              <div
                className="catalog-empty"
                style={{
                  gridColumn: "1 / -1",
                  padding: "60px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2.5rem" }}></div>
                <h3>
                  {t("catalog.noProducts", "No se encontraron productos")}
                </h3>
              </div>
            ) : (
              catalogFiltered.map((p) => (
                <ProductCard
                  key={p.id}
                  p={{
                    ...p,
                    tipoFruta: p.tipoFruta || p.tipo,
                    calificacion: p.calificacion || "4.8",
                  }}
                  t={t}
                  addedStates={{}}
                  handlePedirAhora={addToCart}
                  onViewDetails={setSelectedProduct}
                  onContactProducer={(prod) =>
                    contactProductor(
                      prod.productorNombre ||
                        prod.productor ||
                        prod.nombreProductor,
                    )
                  }
                />
              ))
            )}
          </div>
        </div>
  );
}
