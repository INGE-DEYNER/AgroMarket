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
          <div className="avatar avatar-blue">--</div>
          <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} className="btn btn-secondary btn-sm">Cerrar sesión</a>
        </div>
      </nav>

      <main style={{ padding: '28px 32px', maxWidth: '860px', margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-title">⭐ Reseñas de Productos</span>
          <button className="btn btn-primary" onClick={openModal}>+ Nueva reseña</button>
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
            })
          )}
        </div>
      </main>

      {/* MODAL NUEVA RESEÑA */}
      {showModal && (
        <div className="modal-overlay" id="modalResena">
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <span className="modal-title">Nueva Reseña</span>
              <button type="button" className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">Producto *</label>
              <select className="form-select" id="rProducto" value={selectedProductId} onChange={(e) => { setSelectedProductId(e.target.value); setRProductoError(''); }}>
                <option value="">{t('resenas.selectProductOption', 'Selecciona un producto...')}</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
              <span className="form-error" id="rProductoErr">{rProductoError || 'Selecciona un producto.'}</span>
            </div>

            <div className="form-group">
              <label className="form-label">Calificación *</label>
              <div className="star-input-row" id="starRow">
                {[1, 2, 3, 4, 5].map((val) => (
                  <span className="star-inp" key={val} data-val={val} onClick={() => { setRating(val); setRRatingError(''); }} onMouseEnter={() => setHoverRating(val)} onMouseOut={() => setHoverRating(0)}>★</span>
                ))}
              </div>
              <span className="form-error" id="rRatingErr">{rRatingError || 'Selecciona una calificación.'}</span>
            </div>

            <div className="form-group">
              <label className="form-label">Comentario *</label>
              <textarea className="form-textarea" id="rComentario" placeholder="Describe tu experiencia con el producto..." style={{ minHeight: '100px' }} value={comentario} onChange={(e) => { setComentario(e.target.value); setRComentError(''); }}></textarea>
              <span className="form-error" id="rComentErr">{rComentError || 'Escribe un comentario.'}</span>
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
