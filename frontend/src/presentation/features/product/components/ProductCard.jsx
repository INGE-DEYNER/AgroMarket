import React from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useDivisa } from "@/app/hooks/useDivisa";

const ProductCard = React.memo(
  ({
    p,
    t,
    addedStates,
    handlePedirAhora,
    onViewDetails,
    onContactProducer,
    onToggleWishlist,
  }) => {
    const { user } = useAuth();
    // Divisa global: formatearPrecio reacciona a idioma + divisa en todo el proyecto.
    const { formatearPrecio } = useDivisa();
    const formatPrice = (v) => formatearPrecio(v);

    return (
      <div className="catalog-card" style={{ cursor: "pointer" }}>
        <div
          className="catalog-card-img-wrap"
          onClick={() => onViewDetails?.(p)}
        >
          <img
            src={
              p.imagenUrl ||
              "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500"
            }
            alt={p.nombre}
            loading="lazy"
          />
          <span className={`catalog-card-badge${p.stock <= 0 ? " out" : ""}`}>
            {p.stock > 0
              ? t("catalog.available", "Disponible")
              : t("catalog.soldOut", "Agotado")}
          </span>
          {p.enPromocion && (
            <span
              className="badge-promo"
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "var(--red)",
                color: "#fff",
                fontSize: "0.7rem",
                padding: "4px 8px",
                borderRadius: "4px",
                fontWeight: "bold",
              }}
            >
              % {t("catalog.promo", "PROMO")}
            </span>
          )}
        </div>
        <div className="catalog-card-body">
          {p.tipoFruta && (
            <div
              className="catalog-card-tipo"
              onClick={() => onViewDetails?.(p)}
            >
              {p.tipoFruta}
            </div>
          )}
          <div
            className="catalog-card-name"
            onClick={() => onViewDetails?.(p)}
            style={{
              fontWeight: "700",
              fontSize: "1.05rem",
              margin: "4px 0 8px 0",
            }}
          >
            {p.nombre}
          </div>
          <div
            className="catalog-card-producer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexWrap: "wrap",
              marginBottom: "8px",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onContactProducer?.(p);
              }}
              style={{
                textDecoration: "underline",
                color: "var(--primary)",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {p.productorNombre ||
                p.productor ||
                p.nombreProductor ||
                t("catalog.registeredProducer", "Productor ASAFRUT")}
            </span>
            {p.productorVerificado && (
              <span
                style={{
                  background: "#e2f0d9",
                  color: "#385723",
                  padding: "1px 5px",
                  borderRadius: "4px",
                  fontSize: "0.6rem",
                  fontWeight: "700",
                  border: "1px solid #385723",
                }}
              >
                {t("catalog.goldSupplier", "Gold Supplier")}
              </span>
            )}
          </div>

          {p.cantidadMinimaMayorista && p.precioMayorista && (
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-dim)",
                background: "var(--card-bg-sub)",
                padding: "6px 8px",
                borderRadius: "6px",
                margin: "8px 0",
                border: "1px dashed var(--border-light)",
              }}
              onClick={() => onViewDetails?.(p)}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{t("catalog.retail", "Por menor:")}</span>
                <span>
                  {formatPrice(p.precio)}
                  {t("catalog.perKg", "/kg")}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "600",
                  color: "var(--primary)",
                }}
              >
                <span>
                  {t("catalog.wholesaleFrom", "Por mayor (≥{{qty}}kg):", {
                    qty: p.cantidadMinimaMayorista,
                  })}
                </span>
                <span>
                  {formatPrice(p.precioMayorista)}
                  {t("catalog.perKg", "/kg")}
                </span>
              </div>
            </div>
          )}
          <div
            className="catalog-card-rating"
            onClick={() => onViewDetails?.(p)}
          >
            {p.calificacion ? (
              <>
                ★★★★★<span>({p.calificacion})</span>
              </>
            ) : (
              <span style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>
                {t("catalog.noReviews", "Sin reseñas aún")}
              </span>
            )}
          </div>
          <div className="catalog-card-footer">
            <div
              className="catalog-card-price"
              onClick={() => onViewDetails?.(p)}
            >
              {p.enPromocion && p.precioPromocion ? (
                <div>
                  <span
                    style={{
                      textDecoration: "line-through",
                      color: "var(--text-dim)",
                      fontSize: "0.8rem",
                      marginRight: "6px",
                    }}
                  >
                    {formatPrice(p.precio)}
                  </span>
                  <span style={{ color: "var(--red)", fontWeight: "bold" }}>
                    {formatPrice(p.precioPromocion)}
                  </span>
                </div>
              ) : (
                <span>{formatPrice(p.precio)}</span>
              )}
              <small>{t("catalog.perKg", "/kg")}</small>
            </div>
            {(!user ||
              (user.role?.toLowerCase() !== "productor" &&
                user.role?.toLowerCase() !== "admin")) && (
              <button
                className={`catalog-card-add ${addedStates[p.id] ? "added" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePedirAhora(p);
                }}
                disabled={p.stock <= 0}
              >
                {addedStates[p.id]
                  ? t("catalog.added", "✓ Agregado")
                  : t("catalog.addToCart", "+ Agregar")}
              </button>
            )}
            {onToggleWishlist && user && (
              <button
                type="button"
                className="catalog-card-wishlist"
                aria-label="Guardar en lista de deseos"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(p);
                }}
              >
                ♡
              </button>
            )}
          </div>
        </div>
      </div>
    );
  },
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
