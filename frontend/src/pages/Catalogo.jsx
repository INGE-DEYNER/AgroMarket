import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/catalogo.css';

const CATEGORIES = [
  { label: 'Todos', emoji: '🌿', value: '' },
  { label: 'Frutas', emoji: '🍌', value: 'Frutas' },
  { label: 'Verduras', emoji: '🥦', value: 'Verduras' },
  { label: 'Tubérculos', emoji: '🥔', value: 'Tubérculos' },
  { label: 'Granos', emoji: '🫘', value: 'Granos' },
  { label: 'Otros', emoji: '⚙️', value: 'Otros' },
];

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton-line short" />
        <div className="skeleton-line mid" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" style={{ marginTop: '14px' }} />
      </div>
    </div>
  );
}

export default function Catalogo() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if logged in to their specific dashboard catalog
  if (user) {
    const role = user.role?.toLowerCase();
    if (role === 'comprador') {
      return <Navigate to="/dashboard-comprador?section=catalogo" replace />;
    } else if (role === 'productor') {
      return <Navigate to="/dashboard-productor?section=misProductos" replace />;
    } else if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
  }

  const { cart, addToCart, removeFromCart, updateQty, total, count, clearCart } = useCart();

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [soloPromo, setSoloPromo] = useState(false);
  
  const [cartOpen, setCartOpen] = useState(false);

  // Debounced search logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/productos');
      const extractArray = (res) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (res.data) {
          if (Array.isArray(res.data)) return res.data;
          if (res.data.content && Array.isArray(res.data.content)) return res.data.content;
        }
        if (res.content && Array.isArray(res.content)) return res.content;
        return [];
      };
      setProductos(extractArray(data));
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error al conectar con la plataforma AgroMarket. Por favor verifica tu conexión.');
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = productos.filter((p) => {
    const matchSearch =
      !search ||
      p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      p.tipoFruta?.toLowerCase().includes(search.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(search.toLowerCase());

    // Category mappings in frontend
    const matchTipo = !filtroTipo || (
      filtroTipo === 'Frutas' && ['BANANO', 'MANGO', 'PINA', 'MARACUYA', 'GUANABANA', 'NARANJA', 'COCO', 'LIMON'].includes(p.tipoFruta)
    ) || (
      filtroTipo === 'Otros' && p.tipoFruta === 'OTRO'
    ) || (
      filtroTipo === 'Verduras' && false
    ) || (
      filtroTipo === 'Tubérculos' && false
    ) || (
      filtroTipo === 'Granos' && false
    );

    const matchMin = !minPrice || Number(p.precio) >= Number(minPrice);
    const matchMax = !maxPrice || Number(p.precio) <= Number(maxPrice);
    const matchPromo = !soloPromo || p.enPromocion === true;

    return matchSearch && matchTipo && matchMin && matchMax && matchPromo;
  });

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      await api.post('/pedidos', {
        items: cart.map((i) => ({ productoId: i.id, cantidad: i.qty })),
      });
      clearCart();
      setCartOpen(false);
      navigate('/pedidos');
    } catch (err) {
      alert(t('catalog.alertCheckoutError', 'Error al procesar el pedido: ') + (err.message || t('errors.tryAgain', 'Inténtalo de nuevo.')));
    }
  };

  return (
    <>
      <Navbar />
      <div className="catalog-page">
        <div className="catalog-container">

          {/* ─── HERO BANNER ─── */}
          <div className="catalog-hero" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1f4d2a 100%)' }}>
            <div className="catalog-hero-text">
              <div className="catalog-hero-badge">{t('catalog.heroBadge', '🌿 ASAFRUT · Chigorodó, Antioquia')}</div>
              <h1 className="catalog-hero-title">
                {t('catalog.heroTitle', 'Frutas tropicales')}<br />
                <span>{t('catalog.heroTitleSpan', 'directo del campo')}</span>
              </h1>
              <p className="catalog-hero-sub">
                {t('catalog.heroSub', 'Productos frescos de los agricultores de ASAFRUT. Sin intermediarios, precios justos.')}
              </p>
            </div>
            <div className="catalog-hero-emoji">🍌</div>
          </div>

          {/* ERROR STATUS */}
          {error && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', background: '#fef2f2', border: '1px solid #dc2626', color: '#b91c1c', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px' }}>
              <p style={{ fontWeight: '600' }}>⚠️ {error}</p>
              <button className="btn btn-primary" onClick={fetchProducts}>Reintentar 🔄</button>
            </div>
          )}

          {/* ─── FILTERS & SEARCH CONTROL ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'flex-start', margin: '0 0 24px 0' }} className="catalog-layout-grid">
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="catalog-controls">
                <div className="search-wrapper">
                  <span className="search-icon">🔍</span>
                  <input
                    className="search-input"
                    type="text"
                    id="searchCatalog"
                    placeholder={t('catalog.searchPlaceholder', 'Buscar productos...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {count > 0 && (
                  <button className="cart-btn-floating" onClick={() => setCartOpen(true)}>
                    🛒 {t('catalog.cartButton', 'Carrito')}
                    <span className="cart-badge">{count}</span>
                  </button>
                )}
              </div>

              {/* CATEGORY CHIPS */}
              <div className="category-chips" id="categoryChips">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    className={`chip${filtroTipo === cat.value ? ' active' : ''}`}
                    onClick={() => setFiltroTipo(cat.value)}
                  >
                    <span className="chip-emoji">{cat.emoji}</span>
                    {t('catalog.category.' + (cat.value || 'all'), cat.label)}
                  </button>
                ))}
              </div>
            </div>

            {/* SIDE FILTER CONTROLS */}
            <div className="card-table" style={{ padding: '20px', borderRadius: 'var(--radius)', background: '#fff' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                ⚙️ Filtros Avanzados
              </h4>
              
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Precio Mínimo (COP)</label>
                <input 
                  className="form-input" 
                  type="number" 
                  placeholder="$ Mín" 
                  value={minPrice} 
                  onChange={(e) => setMinPrice(e.target.value)} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Precio Máximo (COP)</label>
                <input 
                  className="form-input" 
                  type="number" 
                  placeholder="$ Máx" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(e.target.value)} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                <input 
                  type="checkbox" 
                  id="promoToggle" 
                  checked={soloPromo} 
                  onChange={(e) => setSoloPromo(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="promoToggle" style={{ fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer' }}>
                  🔥 Sólo Promociones
                </label>
              </div>

              {(minPrice || maxPrice || soloPromo || filtroTipo) && (
                <button 
                  className="btn btn-secondary btn-sm" 
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={() => { setMinPrice(''); setMaxPrice(''); setSoloPromo(false); setFiltroTipo(''); setSearchQuery(''); }}
                >
                  Limpiar Filtros
                </button>
              )}
            </div>
          </div>

          {/* ─── META INFO ─── */}
          {!loading && !error && (
            <div className="catalog-meta">
              <p className="catalog-meta-count">
                <strong>{filtered.length}</strong> {filtered.length === 1 ? t('catalog.resultsFound', 'producto encontrado') : t('catalog.resultsFoundPlural', 'productos encontrados')}
                {filtroTipo && ` · ${t('catalog.category.' + filtroTipo, filtroTipo)}`}
                {search && ` · "${search}"`}
              </p>
            </div>
          )}

          {/* ─── PRODUCT GRID ─── */}
          <div className="catalog-grid" id="catalogGrid">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filtered.length === 0 ? (
              <div className="catalog-empty">
                <div className="catalog-empty-icon">🔍</div>
                <div className="catalog-empty-title">{t('catalog.noProducts', 'No se encontraron productos')}</div>
                <div className="catalog-empty-sub">
                  {t('catalog.noProductsDesc', 'Intenta con otra búsqueda o filtros')}
                </div>
              </div>
            ) : (
              filtered.map((p) => (
                <div key={p.id} className="catalog-card">
                  <div className="catalog-card-img-wrap">
                    <img
                      src={
                        p.imagenUrl ||
                        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'
                      }
                      alt={p.nombre}
                      loading="lazy"
                    />
                    <span className={`catalog-card-badge${p.stock <= 0 ? ' out' : ''}`}>
                      {p.stock > 0 ? t('catalog.available', '✓ Disponible') : t('catalog.soldOut', '✗ Agotado')}
                    </span>
                    {p.enPromocion && (
                      <span className="badge-promo" style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--red)', color: '#fff', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                        % PROMO
                      </span>
                    )}
                  </div>
                  <div className="catalog-card-body">
                    {p.tipoFruta && <div className="catalog-card-tipo">{p.tipoFruta}</div>}
                    <div className="catalog-card-name">{p.nombre}</div>
                    <div className="catalog-card-producer" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      {p.productorNombre || p.productor || 'Productor ASAFRUT'}
                      {p.productorVerificado && (
                        <span style={{ background: '#e2f0d9', color: '#385723', padding: '1px 5px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '700', border: '1px solid #385723' }}>
                          ⭐ Gold Supplier
                        </span>
                      )}
                    </div>

                    {p.cantidadMinimaMayorista && p.precioMayorista && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', background: 'var(--card-bg-sub)', padding: '6px 8px', borderRadius: '6px', margin: '8px 0', border: '1px dashed var(--border-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Por menor:</span>
                          <span>${Number(p.precio).toLocaleString('es-CO')}/kg</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: 'var(--primary)' }}>
                          <span>Por mayor (≥{p.cantidadMinimaMayorista}kg):</span>
                          <span>${Number(p.precioMayorista).toLocaleString('es-CO')}/kg</span>
                        </div>
                      </div>
                    )}
                    <div className="catalog-card-rating">
                      ★★★★★
                      <span>({p.calificacion || '4.8'})</span>
                    </div>
                    <div className="catalog-card-footer">
                      <div className="catalog-card-price">
                        {p.enPromocion && p.precioPromocion ? (
                          <div>
                            <span style={{ textDecoration: 'line-through', color: 'var(--text-dim)', fontSize: '0.8rem', marginRight: '6px' }}>
                              ${Number(p.precio).toLocaleString('es-CO')}
                            </span>
                            <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>
                              ${Number(p.precioPromocion).toLocaleString('es-CO')}
                            </span>
                          </div>
                        ) : (
                          `$${Number(p.precio).toLocaleString('es-CO')}`
                        )}
                        <small>{t('catalog.perKg', '/kg')}</small>
                      </div>
                      <button
                        className="catalog-card-add"
                        onClick={() => addToCart(p)}
                        disabled={p.stock <= 0}
                      >
                        {t('catalog.addToCart', '+ Agregar')}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ─── CART DRAWER ─── */}
      {cartOpen && (
        <div className="cart-drawer-overlay" id="cartOverlay" onClick={() => setCartOpen(false)} />
      )}
      <div className={`cart-drawer${cartOpen ? ' open' : ''}`} id="cartDrawer">
        <div className="cart-header">
          <div className="cart-header-title">
            🛒 {t('catalog.cartTitle', 'Mi carrito')}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '400' }}>
              ({count} {t('catalog.cartItems', 'items')})
            </span>
          </div>
          <button className="cart-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>

        <div className="cart-items" id="cartItemsContainer">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <div className="cart-empty-text">{t('catalog.emptyCart', 'Tu carrito está vacío')}</div>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item-row">
                <img
                  src={item.imagenUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120'}
                  alt={item.nombre}
                  className="cart-item-thumb"
                />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.nombre}</div>
                  <div className="cart-item-price">
                    {item.cantidadMinimaMayorista && item.precioMayorista && item.qty >= item.cantidadMinimaMayorista ? (
                      <>
                        <span style={{ textDecoration: 'line-through', marginRight: '6px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          ${Number(item.precio).toLocaleString('es-CO')}/kg
                        </span>
                        <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
                          ${Number(item.precioMayorista).toLocaleString('es-CO')}/kg
                        </span>
                      </>
                    ) : (
                      `$${Number(item.precio).toLocaleString('es-CO')}/kg`
                    )}
                  </div>
                  <div className="cart-qty-controls">
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                    <span className="qty-val">{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                </div>
                <button className="cart-item-del" onClick={() => removeFromCart(item.id)}>✕</button>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer" id="cartFooter">
          <div className="cart-subtotal-row">
            <span>{t('catalog.subtotal', 'Subtotal')}</span>
            <span>${total.toLocaleString('es-CO')}</span>
          </div>
          <div className="cart-subtotal-row">
            <span>{t('catalog.shippingEst', 'Envío estimado')}</span>
            <span>$15.000</span>
          </div>
          <div className="cart-total-row">
            <span>{t('catalog.total', 'TOTAL')}</span>
            <span>${(total + 15000).toLocaleString('es-CO')}</span>
          </div>
          <button className="btn-checkout" onClick={handleCheckout}>
            {t('catalog.checkoutBtn', 'Proceder al pago →')}
          </button>
          <button className="btn-keep-shopping" onClick={() => setCartOpen(false)}>
            {t('catalog.keepShopping', 'Seguir comprando')}
          </button>
        </div>
      </div>
    </>
  );
}
