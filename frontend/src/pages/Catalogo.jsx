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
    <div className="product-card">
      {producto.enPromocion && (
        <span className="badge-promo">{t('catalogo.offer')}</span>
      )}
      <div className="product-img-container">
        <img
          src={producto.imagenUrl || 'https://placehold.co/400x300/e8f5e9/1a5c2a?text=Fruta'}
          alt={producto.nombre}
          onError={(e) => {
            e.target.src = 'https://placehold.co/400x300/e8f5e9/1a5c2a?text=' + t('catalogo.fruitPlaceholder');
          }}
        />
      </div>
      <div className="product-body">
        <span className="product-name">{producto.nombre}</span>
        <div className="product-rating">
          ★ {Number(producto.calificacionPromedio || 0).toFixed(1)}{' '}
          <span className="rating-value">({producto.totalResenas || 0})</span>
        </div>
        <div className="product-price">
          {formatearPrecio(producto.precio)}<span>/kg</span>
        </div>
        <button
          className="btn-add-cart"
          disabled={!hasStock}
          onClick={() => onAddToCart(producto)}
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
      <div className="cart-drawer-overlay open" onClick={onClose} />
      <div className="cart-drawer open">
        <div className="cart-header">
          <h3>
            🛒 {t('catalogo.cartTitle')}{' '}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 400 }}>
              ({items.length} {t('catalogo.items')})
            </span>
          </h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="cart-content">
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '60px', color: '#6b7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
              <div style={{ fontWeight: 600 }}>{t('catalogo.cartEmpty')}</div>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <img
                    className="cart-item-img"
                    src={item.img || 'https://placehold.co/100x100/e8f5e9/1a5c2a?text=Fruta'}
                    alt={item.nombre}
                    onError={(e) => {
                      e.target.src =
                        'https://placehold.co/100x100/e8f5e9/1a5c2a?text=' +
                        t('catalogo.fruitPlaceholder');
                    }}
                  />
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.nombre}</div>
                    <div className="cart-item-meta">
                      {formatearPrecio(item.precio)}/kg
                    </div>
                    <div className="cart-item-controls">
                      <button
                        type="button"
                        className="control-btn"
                        onClick={() => onUpdateQty(item.id, -1)}
                      >
                        −
                      </button>
                      <span className="cart-item-qty">{item.cantidad}</span>
                      <button
                        type="button"
                        className="control-btn"
                        onClick={() => onUpdateQty(item.id, 1)}
                      >
                        +
                      </button>
                      <span className="cart-item-total">
                        {formatearPrecio(item.precio * item.cantidad)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cart-item-remove"
                    onClick={() => onRemove(item.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-row">
              <span>{t('catalogo.subtotal')}</span>
              <span>{formatearPrecio(total)}</span>
            </div>
            <div className="cart-summary-row">
              <span>{t('catalogo.shipping')}</span>
              <span>{formatearPrecio(DELIVERY)}</span>
            </div>
            <div className="cart-summary-total">
              <span>{t('catalogo.total')}</span>
              <span>{formatearPrecio(total + DELIVERY)}</span>
            </div>
            <div className="cart-actions">
              <button
                type="button"
                className="btn btn-primary btn-cta"
                onClick={onCheckout}
              >
                {t('catalogo.finishPurchase')}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                {t('catalogo.keepShopping', 'Seguir comprando')}
              </button>
            </div>
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
    const coincideTexto =
      !q ||
      p.nombre.toLowerCase().includes(q) ||
      (p.productorNombre || '').toLowerCase().includes(q);
    const coincideTipo =
      !tipoFiltro ||
      String(p.tipoFruta || '').toUpperCase() === String(tipoNorm).toUpperCase();
    return coincideTexto && coincideTipo;
  });

  const handleAddToCart = useCallback(
    (producto) => {
      addItem(
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          img:
            producto.imagenUrl ||
            'https://placehold.co/100x100/e8f5e9/1a5c2a?text=' +
              t('catalogo.fruitPlaceholder'),
        },
        1,
      );
      showToast(
        t('general.productAddedToCart', { productName: producto.nombre }),
        'success',
      );
      setCartOpen(true);
    },
    [addItem, t],
  );

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
      setTimeout(() => {
        navigate('/pedidos');
      }, 1200);
    } catch (err) {
      showToast(err?.message || t('errores.checkoutError'), 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <>
      <Navbar />

      <main
        style={{
          padding: '28px 32px',
          maxWidth: '1280px',
          margin: '0 auto',
        }}
      >
        <div className="catalog-hero">
          <div>
            <div className="hero-title">
              Frutas tropicales
              <br />
              directo del campo 🌿
            </div>
            <div className="hero-sub">
              Productos frescos de los agricultores de ASAFRUT en Chigorodó,
              Antioquia.
            </div>
          </div>
        </div>

        <div
          className="filter-bar"
          style={{ display: 'flex', gap: '12px', marginBottom: 8, flexWrap: 'wrap' }}
        >
          <input
            className="search-input"
            type="text"
            id="searchCatalog"
            placeholder={t('catalogo.searchProductsPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: '1 1 240px',
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(45,106,79,.2)',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          <select
            className="form-select"
            id="filtroTipo"
            style={{ width: 160 }}
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
          >
            <option value="">{t('catalogo.allTypes')}</option>
            {Object.keys(TIPO_MAP).map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px',
              color: '#6b7280',
              fontWeight: 600,
            }}
          >
            {t('catalogo.loadingCatalog')}
          </div>
        ) : error ? (
          <div
            style={{
              padding: '16px',
              background: '#fff1f2',
              borderRadius: '12px',
              color: '#9f1239',
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        ) : filteredProductos.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px',
              color: '#6b7280',
              fontWeight: 600,
            }}
          >
            {t('catalogo.noProductsFound')}
          </div>
        ) : (
          <div className="products-grid" id="catalogGrid">
            {filteredProductos.map((producto) => (
              <ProductCard
                key={producto.id}
                producto={producto}
                onAddToCart={handleAddToCart}
              />
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
