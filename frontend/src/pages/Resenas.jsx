// File: frontend/src/pages/Resenas.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api.js';
import { showToast } from '../utils/ui.js';
import Navbar from '../components/Navbar.jsx';
import '../styles/styles.css';
import '../styles/resenas.css';

export default function Resenas() {
  const { t } = useTranslation();
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
      <Navbar />
      <main style={{ padding: '28px 32px', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a3a2a', margin: 0 }}>
            ⭐ {t('resenas.title', 'Reseñas de Productos')}
          </h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductChange(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(45,106,79,.2)', fontSize: '0.9rem', background: '#fff' }}
            >
              <option value="">{t('resenas.selectProductOption', 'Selecciona un producto...')}</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
            <button
              onClick={openModal}
              style={{ padding: '10px 20px', borderRadius: '10px', border: 0, background: '#2d6a4f', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
            >
              {t('resenas.newReviewBtn', '+ Nueva reseña')}
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>{t('general.cargando', 'Cargando...')}</div>
        ) : resenas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', background: '#fff', borderRadius: '16px', border: '1px solid rgba(45,106,79,.12)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⭐</div>
            <div style={{ color: '#6b7280' }}>{t('resenas.beFirstToReview', 'Sé el primero en dejar una reseña para este producto.')}</div>
          </div>
        ) : (
          <div id="reviewsList">
            {resenas.map((resena) => {
              const stars = '★'.repeat(Number(resena.calificacion || 0)) + '☆'.repeat(5 - Number(resena.calificacion || 0));
              const bgColor = avatarColor(resena.compradorNombre);
              return (
                <div key={resena.id} className="review-card" style={{ background: '#fff', border: '1px solid rgba(45,106,79,.08)', borderRadius: '16px', padding: '24px', marginBottom: '18px', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                  <div className="review-header" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                      {initials(resena.compradorNombre)}
                    </div>
                    <div className="review-meta" style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#1a3a2a', fontSize: '1rem' }}>{resena.compradorNombre || t('resenas.anonymousBuyer', 'Comprador de AgroMarket')}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                        {new Date(resena.fecha || Date.now()).toLocaleDateString('es-CO')}
                      </div>
                    </div>
                    {selectedProductName && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', background: '#eef7ee', border: '1px solid rgba(45,106,79,.12)', borderRadius: '999px', padding: '4px 12px', fontSize: '0.78rem', color: '#2d7a3a', fontWeight: 500 }}>
                        {selectedProductName}
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#fbbf24', fontSize: '1.15rem', margin: '8px 0', letterSpacing: '2px' }}>{stars}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.7', fontStyle: 'italic' }}>"{resena.comentario}"</div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* New Review Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', maxWidth: '480px', width: '100%', margin: '0 16px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontWeight: 800 }}>{t('resenas.newReviewTitle', 'Nueva Reseña')}</h3>
              <button type="button" onClick={closeModal} style={{ background: 'transparent', border: 0, fontSize: '1.4rem', cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                {t('resenas.productLabel', 'Producto *')}
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => { setSelectedProductId(e.target.value); setRProductoError(''); }}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: `1.5px solid ${rProductoError ? '#dc2626' : 'rgba(45,106,79,.2)'}`, fontSize: '0.9rem', background: '#fff' }}
              >
                <option value="">{t('resenas.selectProductOption', 'Selecciona un producto...')}</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
              {rProductoError && <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{rProductoError}</span>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                {t('resenas.ratingLabel', 'Calificación *')}
              </label>
              <div style={{ display: 'flex', gap: '8px', margin: '8px 0 6px' }}>
                {[1, 2, 3, 4, 5].map((val) => (
                  <span
                    key={val}
                    onClick={() => { setRating(val); setRRatingError(''); }}
                    onMouseEnter={() => setHoverRating(val)}
                    onLeave={() => setHoverRating(0)}
                    style={{
                      fontSize: '1.8rem',
                      cursor: 'pointer',
                      color: val <= (hoverRating || rating) ? '#d97706' : '#d1d5db',
                      transform: val <= (hoverRating || rating) ? 'scale(1.15)' : 'scale(1)',
                      transition: 'color 0.15s, transform 0.15s',
                      userSelect: 'none',
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              {rRatingError && <span style={{ color: '#dc2626', fontSize: '0.8rem', display: 'block' }}>{rRatingError}</span>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                {t('resenas.commentLabel', 'Comentario *')}
              </label>
              <textarea
                value={comentario}
                onChange={(e) => { setComentario(e.target.value); setRComentError(''); }}
                placeholder={t('resenas.commentPlaceholder', 'Describe tu experiencia con el producto...')}
                rows={4}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px',
                  border: `1.5px solid ${rComentError ? '#dc2626' : 'rgba(45,106,79,.2)'}`,
                  fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit'
                }}
              />
              {rComentError && <span style={{ color: '#dc2626', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>{rComentError}</span>}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={closeModal} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                {t('general.cancelar', 'Cancelar')}
              </button>
              <button type="button" onClick={publicarResena} style={{ padding: '10px 20px', borderRadius: '10px', border: 0, background: '#2d6a4f', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                {t('resenas.publishBtn', '⭐ Publicar reseña')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}