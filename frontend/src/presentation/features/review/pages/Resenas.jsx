import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BuyerShell from "@/presentation/features/order/components/BuyerShell";
import { useAuth } from "@/app/hooks/useAuth";
import api from "@/infrastructure/http/api";
import "@/presentation/styles/resenas.css";

/*
 * El backend expone ReviewController con CreateReviewRequest, que exige
 * { productId: Long, reviewerId: Long, rating: 1..5, comment: String }.
 *
 * Esta pagina antes mandaba { producto, calificacion, comentario } con un
 * producto inventado de una lista fija. Como el nombre y el tipo no
 * coincidian, Jackson descartaba el cuerpo y la validacion @NotNull
 * fallaba: publicar una reseña SIEMPRE devolvia 400. Ahora el producto se
 * elige del catalogo real y se manda el contrato del backend.
 */
export default function Resenas() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [rProducto, setRProducto] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comentario, setComentario] = useState("");
  const [errors, setErrors] = useState({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get("/resenas");
        setReviews(Array.isArray(data) ? data : (data?.content ?? []));
      } catch (err) {
        console.error("Error loadResenas:", err);
        setReviews([]);
      }
    })();
  }, []);

  // El selector de producto se alimenta del catalogo real: una reseña siempre
  // referencia un producto existente, con su ID.
  useEffect(() => {
    (async () => {
      try {
        const data = await api.get("/productos?size=100&active=true");
        const lista = Array.isArray(data) ? data : (data?.content ?? []);
        setProductos(
          lista.map((p) => ({
            id: p.id,
            nombre: p.name ?? p.nombre ?? "Producto",
          })),
        );
      } catch (err) {
        console.error("Error loadProductos:", err);
        setProductos([]);
      } finally {
        setCargandoProductos(false);
      }
    })();
  }, []);

  const closeModal = () => setModalOpen(false);

  const validate = () => {
    const errs = {};
    if (!rProducto) errs.producto = t("resenas.errors.product", "Selecciona un producto.");
    if (!rating) errs.rating = t("resenas.errors.rating", "Selecciona una calificación.");
    if (!comentario.trim()) errs.comentario = t("resenas.errors.comment", "Escribe un comentario.");
    return errs;
  };

  const publicarResena = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setEnviando(true);
    try {
      const nueva = await api.post("/resenas", {
        productId: Number(rProducto),
        reviewerId: user?.id,
        rating,
        comment: comentario.trim(),
      });
      setReviews((prev) => [nueva?.data ?? nueva, ...prev]);
      setRProducto("");
      setRating(0);
      setComentario("");
      closeModal();
    } catch (err) {
      setErrors({
        formulario:
          err?.message ||
          t("resenas.errorPublish", "No se pudo publicar la reseña."),
      });
    } finally {
      setEnviando(false);
    }
  };

  const activeStars = hoverRating || rating;

  if (user) {
    const role = user.role?.toLowerCase();
    if (role === "comprador") {
      // Buyers stay on the dedicated reviews page.
    } else if (role === "productor") {
      return <Navigate to="/dashboard-productor" replace />;
    } else if (role === "admin") {
      return <Navigate to="/admin" replace />;
    }
  }
  return (
    <BuyerShell activeKey="resenas">
      <main className="buyer-page-content resenas-page">
        <div className="section-header">
          <span className="section-title">
            {t("resenas.title", "Reseñas de Productos")}
          </span>
          <button
            className="btn btn-primary"
            onClick={() => {
              setModalOpen(true);
              setErrors({});
            }}
          >
            {t("resenas.newReview", "+ Nueva reseña")}
          </button>
        </div>

        <div id="reviewsList">
          {reviews.length === 0 ? (
            <div
              className="empty-state"
              style={{ padding: "60px", textAlign: "center" }}
            >
              <div className="empty-icon"></div>
              <div>
                {t(
                  "resenas.emptyReviews",
                  "No hay reseñas aún. ¡Sé el primero en dejar una!",
                )}
              </div>
            </div>
          ) : (
            reviews.map((r) => (
              <article className="review-card" key={r.id}>
                <div className="review-card-head">
                  <strong>{r.buyerName || t("resenas.anonymous", "Usuario")}</strong>
                  <span className="review-stars" aria-label={`${r.rating} de 5`}>
                    {"★".repeat(Math.max(0, Math.min(5, r.rating ?? 0)))}
                    <span className="review-stars-empty">
                      {"★".repeat(Math.max(0, 5 - (r.rating ?? 0)))}
                    </span>
                  </span>
                </div>
                <div className="review-product">
                  {r.productId != null &&
                    t("resenas.productRef", "Producto") + " #" + r.productId}
                </div>
                <div className="review-comment">{r.comment}</div>
                <div className="review-date">
                  {r.date
                    ? new Date(r.date).toLocaleDateString("es-CO")
                    : ""}
                </div>
              </article>
            ))
          )}
        </div>
      </main>

      {/* MODAL NUEVA RESEÑA */}
      {modalOpen && (
        <div className="modal-overlay open" id="modalResena">
          <div className="modal" style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <span className="modal-title">
                {t("resenas.modalTitle", "Nueva Reseña")}
              </span>
              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                aria-label={t("resenas.cancel", "Cancelar")}
              >
                ×
              </button>
            </div>

            {errors.formulario && (
              <div className="form-error" role="alert">
                {errors.formulario}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="rProducto">
                {t("resenas.productLabel", "Producto *")}
              </label>
              <select
                className="form-select"
                id="rProducto"
                value={rProducto}
                disabled={cargandoProductos || productos.length === 0}
                onChange={(e) => setRProducto(e.target.value)}
              >
                <option value="">
                  {cargandoProductos
                    ? t("resenas.loadingProducts", "Cargando productos...")
                    : productos.length === 0
                      ? t("resenas.noProducts", "No hay productos para reseñar")
                      : t("resenas.selectProduct", "Selecciona un producto...")}
                </option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              {errors.producto && (
                <span className="form-error" id="rProductoErr">
                  {errors.producto}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                {t("resenas.ratingLabel", "Calificación *")}
              </label>
              <div className="star-input-row" id="starRow" role="radiogroup">
                {[1, 2, 3, 4, 5].map((v) => (
                  <span
                    key={v}
                    className="star-inp"
                    role="radio"
                    tabIndex={0}
                    aria-checked={rating === v}
                    aria-label={`${v} de 5`}
                    data-val={v}
                    onClick={() => setRating(v)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setRating(v);
                      }
                    }}
                    onMouseOver={() => setHoverRating(v)}
                    onMouseOut={() => setHoverRating(0)}
                    style={{
                      cursor: "pointer",
                      fontSize: "1.8rem",
                      color:
                        v <= activeStars
                          ? "var(--gold)"
                          : "var(--border-light)",
                      transition: "color 0.15s",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              {errors.rating && (
                <span className="form-error" id="rRatingErr">
                  {errors.rating}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                {t("resenas.commentLabel", "Comentario *")}
              </label>
              <textarea
                className="form-textarea"
                id="rComentario"
                placeholder={t(
                  "resenas.commentPlaceholder",
                  "Describe tu experiencia con el producto...",
                )}
                style={{ minHeight: "100px" }}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              ></textarea>
              {errors.comentario && (
                <span className="form-error" id="rComentErr">
                  {errors.comentario}
                </span>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeModal}
                disabled={enviando}
              >
                {t("resenas.cancel", "Cancelar")}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={publicarResena}
                disabled={enviando}
              >
                {enviando
                  ? t("resenas.publishing", "Publicando...")
                  : t("resenas.publish", "Publicar reseña")}
              </button>
            </div>
          </div>
        </div>
      )}
    </BuyerShell>
  );
}
