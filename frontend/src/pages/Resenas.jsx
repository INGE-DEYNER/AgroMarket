// File: frontend/src/pages/Resenas.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import { showToast } from '../utils/ui.js';
import { useTranslation } from 'react-i18next';
import '../styles/styles.css';
import '../styles/resenas.css';

export default function Resenas() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [productos, setProductos] = useState([]);
  const [resenas, setResenas] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [rProductoError, setRProductoError] = useState('');
  const [rRatingError, setRRatingError] = useState('');
  const [rComentError, setRComentError] = useState('');

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const resp = await api.getProductos({ page: 0, size: 100 });
      const prods = resp?.content || resp || [];
      setProductos(prods);
      if (prods.length > 0) {
        setSelectedProductId(String(prods[0].id));
        const revs = await api.getResenas(prods[0].id);
        setResenas(revs || []);
      }
    } catch (error) {
      showToast(error?.message || t('resenas.loadError', 'No se pudieron cargar las reseñas.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = async (productoId) => {
    setSelectedProductId(productoId);
    if (!productoId) { setResenas([]); return; }
    try {
      const revs = await api.getResenas(productoId);
      setResenas(revs || []);
    } catch (error) {
      showToast(error?.message || t('resenas.loadProductReviewsError', 'Error al cargar las reseñas de este producto.'), 'error');
    }
  };

  const openModal = () => {
    setRating(0);
    setHoverRating(0);
    setComentario('');
    setRProductoError('');
    setRRatingError('');
    setRComentError('');
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const publicarResena = async () => {
    let isValid = true;
    if (!selectedProductId) { setRProductoError(t('resenas.selectProductError', 'Selecciona un producto.')); isValid = false; }
    if (!rating) { setRRatingError(t('resenas.selectRatingError', 'Selecciona una calificación.')); isValid = false; }
    if (!comentario.trim()) { setRComentError(t('resenas.writeCommentError', 'Escribe un comentario.')); isValid = false; }
    if (!isValid) return;

    try {
      await api.crearResena({
        productoId: Number(selectedProductId),
        calificacion: rating,
        comentario: comentario.trim(),
      });
      closeModal();
      const revs = await api.getResenas(selectedProductId);
      setResenas(revs || []);
      showToast(t('resenas.publishedSuccess', 'Reseña publicada.'), 'success');
    } catch (error) {
      showToast(error?.message || t('resenas.publishError', 'No se pudo publicar la reseña.'), 'error');
    }
  };

  const initials = (name) =>
    String(name || '').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const avatarColors = ['#2d6a4f', '#1d4ed8', '#d97706', '#7c3aed', '#dc2626'];
  const avatarColor = (name) => avatarColors[String(name || 'A').charCodeAt(0) % avatarColors.length];

  const selectedProductName = productos.find((p) => String(p.id) === selectedProductId)?.nombre || '';

  return (
    <>
      {/* NAVBAR */}
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
          <a href="/login" className="btn btn-secondary btn-sm">Salir</a>
        </div>
      </nav>

      <main style={{ padding: '28px 32px', maxWidth: '860px', margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-title">⭐ {t('resenas.title', 'Reseñas de Productos')}</span>
          <button className="btn btn-primary" onClick={openModal}>
            + {t('resenas.newReviewBtn', 'Nueva reseña')}
          </button>
        </div>

        <div id="reviewsList">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>{t('general.cargando', 'Cargando...')}</div>
          ) : resenas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', background: '#fff', borderRadius: '16px', border: '1px solid rgba(45,106,79,.12)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⭐</div>
              <div style={{ color: '#6b7280' }}>{t('resenas.beFirstToReview', 'Sé el primero en dejar una reseña para este producto.')}</div>
            </div>
          ) : (
            resenas.map((resena) => {
              const stars = '★'.repeat(Number(resena.calificacion || 0)) + '☆'.repeat(5 - Number(resena.calificacion || 0));
              const bgColor = avatarColor(resena.compradorNombre);
              return (
                <div key={resena.id} className="review-card">
                  <div className="review-header" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                      {initials(resena.compradorNombre)}
                    </div>
                    <div className="review-meta" style={{ flex: 1 }}>
                      <div className="review-user">{resena.compradorNombre || t('resenas.anonymousBuyer', 'Comprador de AgroMarket')}</div>
                      <div className="review-time">
                        {new Date(resena.fecha || Date.now()).toLocaleDateString('es-CO')}
                      </div>
                    </div>
                    {selectedProductName && (
                      <span className="review-product-badge">
                        {selectedProductName}
                      </span>
                    )}
                  </div>
                  <div className="review-stars" style={{ margin: '8px 0' }}>{stars}</div>
                  <div className="review-comment">"{resena.comentario}"</div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* MODAL NUEVA RESEÑA */}
      {showModal && (
        <div className="modal-overlay" id="modalResena">
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <span className="modal-title">{t('resenas.modalTitle', 'Nueva Reseña')}</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">{t('resenas.productLabel', 'Producto')} *</label>
              <select className="form-select" id="rProducto" value={selectedProductId} onChange={(e) => { setSelectedProductId(e.target.value); setRProductoError(''); }}>
                <option value="">{t('resenas.selectProductOption', 'Selecciona un producto...')}</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
              <span className="form-error" id="rProductoErr">{rProductoError || t('resenas.selectProductError', 'Selecciona un producto.')}</span>
            </div>

            <div className="form-group">
              <label className="form-label">{t('resenas.ratingLabel', 'Calificación')} *</label>
              <div className="star-input-row" id="starRow">
                {[1, 2, 3, 4, 5].map((val) => {
                  const isActive = val <= (hoverRating || rating);
                  return (
                    <span
                      key={val}
                      className={`star-inp ${isActive ? 'active' : ''}`}
                      data-val={val}
                      onClick={() => { setRating(val); setRRatingError(''); }}
                      onMouseEnter={() => setHoverRating(val)}
                      onMouseOut={() => setHoverRating(0)}
                    >★</span>
                  );
                })}
              </div>
              <span className="form-error" id="rRatingErr">{rRatingError || t('resenas.selectRatingError', 'Selecciona una calificación.')}</span>
            </div>

            <div className="form-group">
              <label className="form-label">{t('resenas.commentLabel', 'Comentario')} *</label>
              <textarea className="form-textarea" id="rComentario" placeholder={t('resenas.commentPlaceholder', 'Describe tu experiencia con el producto...')} style={{ minHeight: '100px' }} value={comentario} onChange={(e) => { setComentario(e.target.value); setRComentError(''); }}></textarea>
              <span className="form-error" id="rComentErr">{rComentError || t('resenas.writeCommentError', 'Escribe un comentario.')}</span>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>{t('general.cancelar', 'Cancelar')}</button>
              <button className="btn btn-primary" onClick={publicarResena}>⭐ {t('resenas.publishBtn', 'Publicar reseña')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
