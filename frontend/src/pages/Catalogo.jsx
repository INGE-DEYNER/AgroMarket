import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api.js';
import { formatearPrecio, showToast } from '../utils/ui.js';
import { useCart } from '../hooks/useCart.js';
import Navbar from '../components/Navbar.jsx';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';
import '../styles/catalogo.css';

const TIPO_MAP = {
  Banano: 'BANANO',
  Piña: 'PINA',
  Mango: 'MANGO',
  Maracuyá: 'MARACUYA',
  Guanábana: 'GUANABANA',
  Naranja: 'NARANJA',
  Coco: 'COCO',
  Limón: 'LIMON',
};

function ProductCard({ producto, onAddToCart }) {
  const { t } = useTranslation();
  const hasStock = producto.cantidadDisponible > 0;
  return (
    <div className="product-card" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(45,106,79,.12)', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,.06)', display: 'flex', flexDirection: 'column' }}>
      {producto.enPromocion && (
        <span className="badge-promo" style={{ position: 'absolute', top: '12px', left: '12px', background: '#e53935', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
          {t('catalogo.offer')}
        </span>
      )}
      <div className="product-img-container" style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#f0f7f0' }}>
        <img
          src={producto.imagenUrl || 'https://placehold.co/400x300/e8f5e9/1a5c2a?text=Fruta'}
          alt={producto.nombre}
          onError={(e) => { e.target.src = 'https://placehold.co/400x300/e8f5e9/1a5c2a?text=' + t('catalogo.fruitPlaceholder'); }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div className="product-body" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span className="product-name" style={{ fontWeight: 700, fontSize: '1rem', color: '#1a3a2a' }}>{producto.nombre}</span>
        <div className="product-rating" style={{ color: '#f59e0b', fontSize: '0.85rem' }}>
          ★ {Number(producto.calificacionPromedio || 0).toFixed(1)}{' '}
          <span style={{ color: '#9ca3af' }}>({producto.totalResenas || 0})</span>
        </div>
        <div className="product-price" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2d6a4f', marginTop: 'auto' }}>
          {formatearPrecio(producto.precio)}<span style={{ fontWeight: 500, fontSize: '0.8rem', color: '#6b7280' }}>/kg</span>
        </div>
        <button
          className="btn-add-cart"
          disabled={!hasStock}
          onClick={() => onAddToCart(producto)}
          style={{
            marginTop: '8px',
            padding: '10px',
            borderRadius: '10px',
            border: 0,
            background: hasStock ? '#2d6a4f' : '#e5e7eb',
            color: hasStock ? '#fff' : '#9ca3af',
            fontWeight: 700,
            cursor: hasStock ? 'pointer' : 'not-allowed',
            fontSize: '0.9rem',
          }}
        >
          {hasStock ? t('catalogo.addToCart') : t('catalogo.outOfStock')}
        </button>
      </div>
    </div>
  );
}

function CartDrawer({ items, total, onUpdateQty, onRemove, onCheckout, onClose }) {
  const { t } = useTranslation();
  const DELIVERY = 15000;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)',
          zIndex: 200, display: items.length >= 0 ? 'block' : 'none',
        }}
      />
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: '380px',
        background: '#fff', zIndex: 201, boxShadow: '-4px 0 24px rgba(0,0,0,.12)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(45,106,79,.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
            {t('catalogo.cartTitle')} <span style={{ color: '#6b7280', fontWeight: 500, fontSize: '0.9rem' }}>({items.length} {t('catalogo.items')})</span>
          </h2>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 0, fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '60px', color: '#6b7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
              <div style={{ fontWeight: 600 }}>{t('catalogo.cartEmpty')}</div>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                <img
                  src={item.img || 'https://placehold.co/100x100/e8f5e9/1a5c2a?text=Fruta'}
                  alt={item.nombre}
                  onError={(e) => { e.target.src = 'https://placehold.co/100x100/e8f5e9/1a5c2a?text=' + t('catalogo.fruitPlaceholder'); }}
                  style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.nombre}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{formatearPrecio(item.precio)}/kg</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <button type="button" onClick={() => onUpdateQty(item.id, -1)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontWeight: 700 }}>−</button>
                    <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>{item.cantidad}</span>
                    <button type="button" onClick={() => onUpdateQty(item.id, 1)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontWeight: 700 }}>+</button>
                    <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#2d6a4f' }}>{formatearPrecio(item.precio * item.cantidad)}</span>
                  </div>
                </div>
                <button type="button" onClick={() => onRemove(item.id)} style={{ background: 'transparent', border: 0, color: '#dc2626', cursor: 'pointer', padding: '4px' }}>✕</button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(45,106,79,.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
              <span>{t('catalogo.subtotal')}</span><span>{formatearPrecio(total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.9rem', color: '#6b7280' }}>
              <span>{t('catalogo.shipping')}</span><span>{formatearPrecio(DELIVERY)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontWeight: 800, fontSize: '1.05rem' }}>
              <span>{t('catalogo.total')}</span><span>{formatearPrecio(total + DELIVERY)}</span>
            </div>
            <button
              type="button"
              onClick={onCheckout}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 0,
                background: '#2d6a4f', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '1rem',
              }}
            >
              {t('catalogo.finishPurchase')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function Catalogo() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const { items, addItem, removeItem, updateQty, clearCart, total, count } = useCart();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openCart') === 'true') {
      setCartOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const page = await api.getProductos({ page: 0, size: 100 });
      setProductos(page?.content || []);
    } catch (err) {
      setError(err?.message || t('errores.catalogLoadError'));
    } finally {
      setLoading(false);
    }
  };

  const filteredProductos = productos.filter((p) => {
    const q = search.toLowerCase();
    const tipoNorm = TIPO_MAP[tipoFiltro] || tipoFiltro;
    const coincideTexto = !q || p.nombre.toLowerCase().includes(q) || (p.productorNombre || '').toLowerCase().includes(q);
    const coincideTipo = !tipoFiltro || String(p.tipoFruta || '').toUpperCase() === String(tipoNorm).toUpperCase();
    return coincideTexto && coincideTipo;
  });

  const handleAddToCart = useCallback((producto) => {
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      img: producto.imagenUrl || 'https://placehold.co/100x100/e8f5e9/1a5c2a?text=' + t('catalogo.fruitPlaceholder'),
    }, 1);
    showToast(t('general.productAddedToCart', { productName: producto.nombre }), 'success');
    setCartOpen(true);
  }, [addItem, t]);

  const handleCheckout = async () => {
    if (!items.length) return;
    setCheckingOut(true);
    try {
      for (const item of items) {
        await api.crearPedido(item.id, item.cantidad);
      }
      clearCart();
      setCartOpen(false);
      showToast(t('general.orderProcessedSuccess'), 'success');
      setTimeout(() => { navigate('/pedidos'); }, 1200);
    } catch (err) {
      showToast(err?.message || t('errores.checkoutError'), 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <>
      <Navbar />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#1a3a2a' }}>{t('catalogo.catalogTitle')}</h1>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            style={{
              position: 'relative', padding: '10px 18px', borderRadius: '12px',
              border: 0, background: '#2d6a4f', color: '#fff', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            🛒 {t('nav.carrito')}
            {count > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-8px',
                background: '#dc2626', color: '#fff', borderRadius: '50%',
                fontSize: '0.7rem', fontWeight: 700, width: '20px', height: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {count}
              </span>
            )}
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder={t('catalogo.searchProductsPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: '1 1 240px', padding: '10px 16px', borderRadius: '12px',
              border: '1px solid rgba(45,106,79,.2)', fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            style={{
              padding: '10px 16px', borderRadius: '12px',
              border: '1px solid rgba(45,106,79,.2)', fontSize: '0.95rem',
              outline: 'none', background: '#fff',
            }}
          >
            <option value="">{t('catalogo.allTypes')}</option>
            {Object.keys(TIPO_MAP).map((tipo) => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', fontWeight: 600 }}>
            {t('catalogo.loadingCatalog')}
          </div>
        ) : error ? (
          <div style={{ padding: '16px', background: '#fff1f2', borderRadius: '12px', color: '#9f1239', fontWeight: 600 }}>
            {error}
          </div>
        ) : filteredProductos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', fontWeight: 600 }}>
            {t('catalogo.noProductsFound')}
          </div>
        ) : (
          <div id="catalogGrid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '20px',
          }}>
            {filteredProductos.map((producto) => (
              <ProductCard key={producto.id} producto={producto} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </main>

      {cartOpen && (
        <CartDrawer
          items={items}
          total={total}
          onUpdateQty={updateQty}
          onRemove={removeItem}
          onCheckout={handleCheckout}
          onClose={() => setCartOpen(false)}
        />
      )}
    </>
  );
}