import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PublicLayout from "@/presentation/shared/components/PublicLayout";
import { useCart } from "@/presentation/features/order/hooks/useCart";
import { useAuth } from "@/app/hooks/useAuth";
import { useDivisa } from "@/app/hooks/useDivisa";
import api from "@/infrastructure/http/api";
import Icon from "@/presentation/shared/components/Icon";

export default function ProductoDetalle() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { formatearPrecio, divisaActual } = useDivisa();
  const formatPrice = (v) => formatearPrecio(v);

  const FRUIT_LABELS = {
    PASSION_FRUIT: t("catalog.fruits.Maracuyá", "Maracuyá"),
  };

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/productos/${id}`)
      .then((res) => {
        setProduct(res?.data ?? res);
      })
      .catch((err) => {
        console.error("Error cargando producto:", err);
        setError(
          t("productDetail.loadError", "No se pudo cargar el producto."),
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      ...product,
      nombre: product.name,
      precio: product.price,
      imagenUrl: product.imageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const canBuy =
    !user ||
    (user.role?.toLowerCase() !== "productor" &&
      user.role?.toLowerCase() !== "admin");

  if (loading) {
    return (
      <PublicLayout>
        <div style={{ padding: "80px 20px", textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <p>{t("productDetail.loading", "Cargando producto…")}</p>
        </div>
      </PublicLayout>
    );
  }

  if (error || !product) {
    return (
      <PublicLayout>
        <div style={{ padding: "80px 20px", textAlign: "center" }}>
          <Icon name="alert" size={48} className="text-gray-400 mx-auto" />
          <h2 style={{ marginTop: 16 }}>
            {t("productDetail.notFound", "Producto no encontrado")}
          </h2>
          <p style={{ color: "var(--text-dim)" }}>
            {error ||
              t(
                "productDetail.notFoundDesc",
                "Este producto no existe o fue eliminado.",
              )}
          </p>
          <button
            type="button"
            onClick={() => navigate("/catalogo")}
            style={{
              marginTop: 24,
              padding: "12px 28px",
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ← {t("productDetail.backToCatalog", "Volver al catálogo")}
          </button>
        </div>
      </PublicLayout>
    );
  }

  const fruitLabel = FRUIT_LABELS[product.fruitType] ?? product.fruitType ?? "";
  const producerName =
    product.producer?.name ??
    (product.producer
      ? `${product.producer.firstName ?? ""} ${product.producer.lastName ?? ""}`.trim()
      : t("productDetail.registeredProducer", "Productor registrado"));

  return (
    <PublicLayout>
      <div
        style={{
          maxWidth: 1100,
          margin: "40px auto",
          padding: "0 20px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
          alignItems: "start",
        }}
      >
        {/* Imagen */}
        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            background: "var(--card-bg, #1e1e1e)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            aspectRatio: "1 / 1",
          }}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "6rem",
                color: "var(--text-dim)",
              }}
            >
              <Icon name="leaf" size={24} className="text-green-600 inline" />
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Breadcrumb */}
          <nav style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                cursor: "pointer",
                padding: 0,
                fontWeight: 600,
              }}
            >
              ← Volver
            </button>
            {" / "}
            <button
              type="button"
              onClick={() => navigate("/catalogo")}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Catálogo
            </button>
            {" / "}
            {product.name}
          </nav>

          {fruitLabel && (
            <span
              style={{
                display: "inline-block",
                background: "var(--primary-alpha, rgba(74,163,60,0.15))",
                color: "var(--primary)",
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: "0.8rem",
                fontWeight: 700,
                width: "fit-content",
              }}
            >
              {fruitLabel}
            </span>
          )}

          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {product.name}
          </h1>

          {/* Productor */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "var(--text-dim)",
              fontSize: "0.9rem",
            }}
          >
            <span><Icon name="user" size={20} className="inline text-green-700" /></span>
            <span>
              {t("productDetail.producer", "Productor:")}{" "}
              <strong style={{ color: "var(--primary)" }}>
                {producerName}
              </strong>
            </span>
            {product.producer?.companyName && (
              <span>· {product.producer.companyName}</span>
            )}
          </div>

          {/* Rating */}
          {product.averageRating > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#f5a623" }}><span className="flex gap-1"> <Icon name="star" size={16} /> <Icon name="star" size={16} /> <Icon name="star" size={16} /> <Icon name="star" size={16} /> <Icon name="star" size={16} /> </span></span>
              <strong>{product.averageRating.toFixed(1)}</strong>
              <span style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>
                ({product.totalReviews} {t("productDetail.reviews", "reseñas")})
              </span>
            </div>
          )}

          {/* Precio */}
          <div
            style={{
              background: "var(--card-bg, #1e1e1e)",
              borderRadius: 12,
              padding: "16px 20px",
              border: "1px solid var(--border-light, #333)",
            }}
          >
            {product.onPromotion && product.promotionPrice ? (
              <div>
                <span
                  style={{
                    textDecoration: "line-through",
                    color: "var(--text-dim)",
                    fontSize: "1rem",
                    marginRight: 10,
                  }}
                >
                  {formatPrice(product.price)}
                </span>
                <span
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "#e53935",
                  }}
                >
                  {formatPrice(product.promotionPrice)}
                </span>
              </div>
            ) : (
              <span
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "var(--primary)",
                }}
              >
                {formatPrice(product.price)}
              </span>
            )}
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--text-dim)",
                marginTop: 4,
              }}
            >
              {t("catalog.perKg", "/kg")} · {divisaActual}
            </div>

            {/* Precio mayorista */}
            {product.minimumWholesaleQuantity && product.wholesalePrice && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  background: "rgba(74,163,60,0.1)",
                  borderRadius: 8,
                  border: "1px dashed var(--primary)",
                  fontSize: "0.9rem",
                }}
              >
                <strong>
                  {t("productDetail.wholesale", <><Icon name="package" size={18} className="inline mr-1" /> Precio mayorista:</>)}
                </strong>{" "}
                {formatPrice(product.wholesalePrice)}
                {t("catalog.perKg", "/kg")}{" "}
                {t("productDetail.wholesaleFor", "para pedidos ≥")}{" "}
                {product.minimumWholesaleQuantity} kg
              </div>
            )}
          </div>

          {/* Stock */}
          <div
            style={{
              fontSize: "0.9rem",
              color:
                product.availableQuantity > 0 ? "var(--primary)" : "#e53935",
              fontWeight: 600,
            }}
          >
            {product.availableQuantity > 0
              ? t(
                  "productDetail.inStock",
                  "En stock: {{qty}} kg disponibles",
                  { qty: product.availableQuantity },
                )
              : t("productDetail.outOfStock", "Sin stock disponible")}
          </div>

          {/* Descripción */}
          {product.description && (
            <div>
              <h3
                style={{ marginBottom: 8, fontSize: "1rem", fontWeight: 700 }}
              >
                {t("productDetail.description", "Descripción")}
              </h3>
              <p
                style={{ color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}
              >
                {product.description}
              </p>
            </div>
          )}

          {/* Botones */}
          <div
            style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}
          >
            {canBuy && (
              <button
                type="button"
                disabled={product.availableQuantity <= 0 || added}
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  minWidth: 180,
                  padding: "14px 28px",
                  background: added ? "#388e3c" : "var(--primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  cursor:
                    product.availableQuantity <= 0 ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  fontSize: "1rem",
                  opacity: product.availableQuantity <= 0 ? 0.5 : 1,
                  transition: "background 0.2s",
                }}
              >
                {added
                  ? t("productDetail.added", "Agregado al carrito")
                  : t("productDetail.addToCart", "Agregar al carrito")}
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("/catalogo")}
              style={{
                padding: "14px 20px",
                background: "transparent",
                color: "var(--primary)",
                border: "2px solid var(--primary)",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {t("productDetail.viewCatalog", "Ver catálogo")}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile responsive style */}
      <style>{`
        @media (max-width: 768px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </PublicLayout>
  );
}
