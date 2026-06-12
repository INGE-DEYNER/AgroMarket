import { useState, useEffect } from 'react';
import useStyles from '../hooks/useStyles';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const PRODUCTOS = ['🍌 Banano Urabá', '🍍 Piña Manzana', '🥭 Mango Tommy', '🫐 Maracuyá', '🍈 Guanábana', '🍊 Naranja Valencia', '🥥 Coco Fresco', '🍋 Limón Tahití'];

export default function Resenas() {
  useStyles(["/css/styles.css","/css/resenas.css"]);
  const [reviews, setReviews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [rProducto, setRProducto] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get('/resenas');
        setReviews(Array.isArray(data) ? data : data.content || []);
      } catch {
        setReviews([
          { id: 1, usuario: 'María Torres', producto: '🍌 Banano Urabá', calificacion: 5, comentario: 'Excelente calidad, muy frescos y al mejor precio.', fecha: '2026-05-20' },
          { id: 2, usuario: 'Jorge Restrepo', producto: '🥭 Mango Tommy', calificacion: 4, comentario: 'Muy buenos, llegaron en perfectas condiciones.', fecha: '2026-05-18' },
          { id: 3, usuario: 'Ana Betancur', producto: '🍊 Naranja Valencia', calificacion: 5, comentario: 'Jugosas y dulces. Los mejores cítricos que he probado.', fecha: '2026-05-15' },
        ]);
      }
    })();
  }, []);

  const openModal = () => { setModalOpen(true); setErrors({}); };
  const closeModal = () => setModalOpen(false);

  const setRatingVal = (v) => setRating(v);
  const hoverStar = (v) => setHoverRating(v);
  const resetHover = () => setHoverRating(0);

  const validate = () => {
    const errs = {};
    if (!rProducto) errs.producto = 'Selecciona un producto.';
    if (!rating) errs.rating = 'Selecciona una calificación.';
    if (!comentario.trim()) errs.comentario = 'Escribe un comentario.';
    return errs;
  };

  const publicarResena = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      const nueva = await api.post('/resenas', { producto: rProducto, calificacion: rating, comentario });
      setReviews((prev) => [nueva, ...prev]);
      closeModal();
    } catch {
      setReviews((prev) => [{
        id: Date.now(),
        usuario: 'Yo',
        producto: rProducto,
        calificacion: rating,
        comentario,
        fecha: new Date().toISOString().split('T')[0],
      }, ...prev]);
      closeModal();
    }
    setRProducto(''); setRating(0); setComentario('');
  };

  const activeStars = hoverRating || rating;

  return (
    <>
      <nav className="navbar">
        <Link className="navbar-brand" to="/dashboard-comprador">
          <span className="logo-icon">🌿</span><span>AgroMarket</span>
        </Link>
        <div className="navbar-links" id="navLinks">
          <Link to="/dashboard-comprador">Mi Panel</Link>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/pedidos">Pedidos</Link>
          <Link to="/mensajeria">Mensajes</Link>
          <Link to="/envios">Envíos</Link>
        </div>
        <div className="navbar-right" id="navActions">
          <div className="avatar avatar-blue">MT</div>
          <Link to="/login" className="btn btn-secondary btn-sm">Salir</Link>
        </div>
      </nav>

      <main style={{ padding: '28px 32px', maxWidth: '860px', margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-title">⭐ Reseñas de Productos</span>
          <button className="btn btn-primary" onClick={openModal}>+ Nueva reseña</button>
        </div>

        <div id="reviewsList">
          {reviews.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px', textAlign: 'center' }}>
              <div className="empty-icon">⭐</div>
              <div>No hay reseñas aún. ¡Sé el primero en dejar una!</div>
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="review-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontWeight: '700' }}>{r.usuario || r.nombreUsuario || 'Usuario'}</div>
                  <div style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>{'★'.repeat(r.calificacion || 5)}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '8px' }}>{r.producto || r.nombreProducto}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{r.comentario}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>{r.fecha || r.fechaCreacion}</div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* MODAL NUEVA RESEÑA */}
      {modalOpen && (
        <div className="modal-overlay open" id="modalResena">
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <span className="modal-title">Nueva Reseña</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">Producto *</label>
              <select className="form-select" id="rProducto" value={rProducto} onChange={(e) => setRProducto(e.target.value)}>
                <option value="">Selecciona un producto...</option>
                {PRODUCTOS.map((p) => <option key={p}>{p}</option>)}
              </select>
              {errors.producto && <span className="form-error" id="rProductoErr">{errors.producto}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Calificación *</label>
              <div className="star-input-row" id="starRow">
                {[1, 2, 3, 4, 5].map((v) => (
                  <span
                    key={v}
                    className="star-inp"
                    data-val={v}
                    onClick={() => setRatingVal(v)}
                    onMouseOver={() => hoverStar(v)}
                    onMouseOut={resetHover}
                    style={{ cursor: 'pointer', fontSize: '1.8rem', color: v <= activeStars ? 'var(--gold)' : 'var(--border-light)', transition: 'color 0.15s' }}
                  >★</span>
                ))}
              </div>
              {errors.rating && <span className="form-error" id="rRatingErr">{errors.rating}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Comentario *</label>
              <textarea
                className="form-textarea"
                id="rComentario"
                placeholder="Describe tu experiencia con el producto..."
                style={{ minHeight: '100px' }}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              ></textarea>
              {errors.comentario && <span className="form-error" id="rComentErr">{errors.comentario}</span>}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={publicarResena}>⭐ Publicar reseña</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
