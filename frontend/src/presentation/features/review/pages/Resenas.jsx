import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BuyerShell from "@/presentation/features/order/components/BuyerShell";
import { useAuth } from "@/app/hooks/useAuth";
import api from "@/infrastructure/http/api";
import "@/presentation/styles/resenas.css";

const PRODUCTOS = [
  "Banano UrabÃ¡",
  "PiÃ±a Manzana",
  "Mango Tommy",
  "MaracuyÃ¡",
  "GuanÃ¡bana",
  "Naranja Valencia",
  "Coco Fresco",
  "LimÃ³n TahitÃ­",
];

export default function Resenas() {
  const { t } = useTranslation();
  const { user } = useAuth();


  const [reviews, setReviews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [rProducto, setRProducto] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comentario, setComentario] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get("/resenas");
        setReviews(Array.isArray(data) ? data : data.content || []);
      } catch (err) {
        console.error("Error loadResenas:", err);
        setReviews([]);
      }
    })();
  }, []);

  const openModal = () => {
    setModalOpen(true);
    setErrors({});
  };
  const closeModal = () => setModalOpen(false);

  const setRatingVal = (v) => setRating(v);
  const hoverStar = (v) => setHoverRating(v);
  const resetHover = () => setHoverRating(0);

  const validate = () => {
    const errs = {};
    if (!rProducto)
      errs.producto = t("resenas.errors.product", "Selecciona un producto.");
    if (!rating)
      errs.rating = t("resenas.errors.rating", "Selecciona una calificaciÃ³n.");
    if (!comentario.trim())
      errs.comentario = t("resenas.errors.comment", "Escribe un comentario.");
    return errs;
  };

  const publicarResena = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      const nueva = await api.post("/resenas", {
        producto: rProducto,
        calificacion: rating,
        comentario,
      });
      setReviews((prev) => [nueva, ...prev]);
      closeModal();
    } catch (err) {
      alert(
        t("resenas.errorPublish", "Error al publicar reseÃ±a: ") +
          (err.message || "IntÃ©ntalo de nuevo."),
      );
    }
    setRProducto("");
    setRating(0);
    setComentario("");
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
      <main className="buyer-page-content"
        style={{ padding: "28px 32px", maxWidth: "860px", margin: "0 auto" }}
      >
        <div className="section-header">
          <span className="section-title">
            {" "}
            {t("resenas.title", "ReseÃ±as de Productos")}
          </span>
          <button className="btn btn-primary" onClick={openModal}>
            {t("resenas.newReview", "+ Nueva reseÃ±a")}
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
                  "No hay reseÃ±as aÃºn. Â¡SÃ© el primero en dejar una!",
                )}
              </div>
            </div>
          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                className="review-card"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "var(--radius)",
                  padding: "20px 24px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ fontWeight: "700" }}>
                    {r.usuario || r.nombreUsuario || "Usuario"}
                  </div>
                  <div style={{ color: "var(--gold)", fontSize: "1.1rem" }}>
                    {"â˜…".repeat(r.calificacion || 5)}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--primary)",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  {r.producto || r.nombreProducto}
                </div>
                <div style={{ color: "var(--text-secondary)" }}>
                  {r.comentario}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: "8px",
                  }}
                >
                  {r.fecha || r.fechaCreacion}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* MODAL NUEVA RESEÃ‘A */}
      {modalOpen && (
        <div className="modal-overlay open" id="modalResena">
          <div className="modal" style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <span className="modal-title">
                {t("resenas.modalTitle", "Nueva ReseÃ±a")}
              </span>
              <button className="modal-close" onClick={closeModal}>
                âœ•
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">
                {t("resenas.productLabel", "Producto *")}
              </label>
              <select
                className="form-select"
                id="rProducto"
                value={rProducto}
                onChange={(e) => setRProducto(e.target.value)}
              >
                <option value="">
                  {t("resenas.selectProduct", "Selecciona un producto...")}
                </option>
                {PRODUCTOS.map((p) => (
                  <option key={p}>{p}</option>
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
                {t("resenas.ratingLabel", "CalificaciÃ³n *")}
              </label>
              <div className="star-input-row" id="starRow">
                {[1, 2, 3, 4, 5].map((v) => (
                  <span
                    key={v}
                    className="star-inp"
                    data-val={v}
                    onClick={() => setRatingVal(v)}
                    onMouseOver={() => hoverStar(v)}
                    onMouseOut={resetHover}
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
                    â˜…
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
                  {errors.comentErr || errors.comentario}
                </span>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                {t("resenas.cancel", "Cancelar")}
              </button>
              <button className="btn btn-primary" onClick={publicarResena}>
                {t("resenas.publish", " Publicar reseÃ±a")}
              </button>
            </div>
          </div>
        </div>
      )}
    </BuyerShell>
  );
}
