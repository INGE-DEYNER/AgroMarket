// src/pages/Catalogo.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { useSecureParams } from '../utils/useSecureParams';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';
import '../styles/catalogo.css';

const CATEGORIES = [
  { label: 'Todos', value: '', emoji: '🌿' },
  { label: 'Frutas', value: 'Frutas', emoji: '🍎' },
  { label: 'Verduras', value: 'Verduras', emoji: '🥦' },
  { label: 'Tubérculos', value: 'Tubérculos', emoji: '🥔' },
  { label: 'Granos', value: 'Granos', emoji: '🌾' },
  { label: 'Otros', value: 'Otros', emoji: '🍯' },
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
  const { user, formatPrice } = useAuth();
  const [params, setParams] = useSecureParams();

  const { cart, addToCart, count, setCartOpen } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleContactProductor = (producto) => {
    if (!user) {
      navigate('/login?redirect=/catalogo');
      return;
    }
    const prodId = producto.productorId || producto.productor?.id || 1;
    const prodName = producto.productorNombre || producto.productor || producto.nombreProductor || 'Productor';
    navigate(`/dashboard-comprador?section=mensajeria&contactId=${prodId}&contactName=${encodeURIComponent(prodName)}`);
  };

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState(params.search || '');
  const [search, setSearch] = useState(params.search || '');
  const [filtroTipo, setFiltroTipo] = useState(params.tipo || '');
  const [minPrice, setMinPrice] = useState(params.min || '');
  const [maxPrice, setMaxPrice] = useState(params.max || '');
  const [soloPromo, setSoloPromo] = useState(params.promo === 'true');
  
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Estados visuales móviles
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [addedStates, setAddedStates] = useState({});

  // Debounced search logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Update URL params
  useEffect(() => {
    setParams({
      search: search || undefined,
      tipo: filtroTipo || undefined,
      min: minPrice || undefined,
      max: maxPrice || undefined,
      promo: soloPromo ? 'true' : undefined
    });
  }, [search, filtroTipo, minPrice, maxPrice, soloPromo, setParams]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('page', page);
      queryParams.set('size', 16);
      if (search) queryParams.set('search', search);
      if (filtroTipo) queryParams.set('categoria', filtroTipo);
      if (minPrice) queryParams.set('precioMin', minPrice);
      if (maxPrice) queryParams.set('precioMax', maxPrice);
      if (soloPromo) queryParams.set('enPromocion', 'true');

      const res = await api.get(`/productos?${queryParams.toString()}`);
      const data = res.data || res;
      
      if (Array.isArray(data)) {
        setProductos(data);
        setTotalPages(1);
      } else {
        setProductos(data.content || []);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      }
    } catch (err) {
      setError(t('catalog.errorLoading', 'Error al cargar los productos. Por favor intenta de nuevo.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, filtroTipo, minPrice, maxPrice, soloPromo]);

  const filtered = productos;

  const handlePedirAhora = (producto) => {
    if (!user) {
      localStorage.setItem('producto_pendiente', JSON.stringify({
        productoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
      }));
      navigate('/registro?redirect=/catalogo&accion=comprar');
      return;
    }
    addToCart(producto);
    setAddedStates(prev => ({ ...prev, [producto.id]: true }));
    setTimeout(() => {
      setAddedStates(prev => ({ ...prev, [producto.id]: false }));
    }, 2000);
  };

  return (
    <>
      <Navbar />
      <div className="catalog-page">
        <div className="catalog-container">
          
          {/* BANNER PRINCIPAL */}
          <div className="catalog-hero">
            <div className="catalog-hero-text">
              <span className="catalog-hero-badge">
                🌿 {t('catalog.bannerBadge', '100% Región de Urabá')}
              </span>
              <h1 className="catalog-hero-title">
                {t('catalog.bannerTitle', 'Feria Digital ')}
                <span>{t('catalog.bannerTitleSpan', 'AgroMarket')}</span>
              </h1>
              <p className="catalog-hero-sub">
                {t('catalog.bannerSub', 'Compra frutas y verduras a precios de productor sin intermediarios con trazabilidad total.')}
              </p>
            </div>
            <div className="catalog-hero-emoji">🍎</div>
          </div>

          {/* STATUS DE ERROR */}
          {error && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', background: '#fef2f2', border: '1px solid #dc2626', color: '#b91c1c', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px' }}>
              <p style={{ fontWeight: '600' }}>⚠️ {error}</p>
              <button className="btn btn-primary" onClick={fetchProducts}>Reintentar 🔄</button>
            </div>
          )}

          {/* BOTÓN TOGGLE FILTROS MÓVIL */}
          <button 
            className="btn-toggle-filters-mobile" 
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          >
            {showFiltersMobile ? 'Ocultar Filtros ✕' : 'Filtros Avanzados ⚙️'}
          </button>

          {/* ─── FILTERS & SEARCH CONTROL ─── */}
          <div className="catalog-layout-grid">
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
                     {t('catalog.cartButton', 'Carrito')}
                    <span className="cart-badge">{count}</span>
                  </button>
                )}
              </div>

              {/* CATEGORIES */}
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
            <div className={`card-table catalog-filters-sidebar ${showFiltersMobile ? 'open' : ''}`}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Filtros Avanzados</span>
                <button 
                  className="close-filters-mobile-btn" 
                  onClick={() => setShowFiltersMobile(false)}
                  style={{ display: 'none', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  ✕
                </button>
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
                   Sólo Promociones
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
                {filtroTipo && ` · ${filtroTipo}`}
                {search && ` · "${search}"`}
              </p>
            </div>
          )}

          {/* ─── PRODUCT GRID ─── */}
          <div className="catalog-grid" id="catalogGrid">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filtered.length === 0 ? (
              <div className="catalog-empty-state">
                <div className="catalog-empty-title">{t('catalog.noProducts', 'No se encontraron productos')}</div>
                <div className="catalog-empty-sub">
                  {t('catalog.noProductsDesc', 'Intenta con otra búsqueda o filtros')}
                </div>
              </div>
            ) : (
              filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  p={p}
                  t={t}
                  addedStates={addedStates}
                  handlePedirAhora={handlePedirAhora}
                  onViewDetails={setSelectedProduct}
                  onContactProducer={handleContactProductor}
                />
              ))
            )}
          </div>

          {/* PAGINATION CONTROLS */}
          {!loading && totalPages > 1 && (
            <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px', marginBottom: '16px' }}>
              <button 
                className="btn-cta" 
                style={{ background: page === 0 ? '#ccc' : 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: page === 0 ? 'not-allowed' : 'pointer' }}
                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                disabled={page === 0}
              >
                &larr; Anterior
              </button>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-dark)' }}>
                Página {page + 1} de {totalPages}
              </span>
              <button 
                className="btn-cta" 
                style={{ background: page === totalPages - 1 ? '#ccc' : 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer' }}
                onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={page === totalPages - 1}
              >
                Siguiente &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DETALLE DE PRODUCTO */}
      {selectedProduct && (
        <div className="modal-overlay open" onClick={() => setSelectedProduct(null)}>
          <div className="modal" style={{ maxWidth: '600px', width: '90%', padding: 0, overflow: 'hidden', borderRadius: '16px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'relative', height: '280px' }}>
              <img 
                src={selectedProduct.imagenUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'} 
                alt={selectedProduct.nombre} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button 
                onClick={() => setSelectedProduct(null)} 
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}
              >
                ✕
              </button>
              {selectedProduct.enPromocion && (
                <span style={{ position: 'absolute', top: '16px', left: '16px', background: 'var(--red)', color: '#fff', fontSize: '0.75rem', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold' }}>
                  % PROMO
                </span>
              )}
            </div>
            
            <div style={{ padding: '24px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '600' }}>
                {selectedProduct.tipoFruta || selectedProduct.tipo}
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '4px 0 12px 0', color: 'var(--text-dark)' }}>
                {selectedProduct.nombre}
              </h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ color: 'var(--gold)', fontSize: '1rem' }}>★★★★★</div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>(4.8 de calificación)</span>
                <span className={`catalog-card-badge${selectedProduct.stock <= 0 ? ' out' : ''}`} style={{ background: selectedProduct.stock > 0 ? 'var(--green-bg)' : 'var(--red-bg)', color: selectedProduct.stock > 0 ? 'var(--primary)' : 'var(--red)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                  {selectedProduct.stock > 0 ? `Stock: ${selectedProduct.stock} kg` : 'Agotado'}
                </span>
              </div>
              
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '20px' }}>
                {selectedProduct.descripcion || 'Fruta tropical fresca cosechada directamente en las fincas de Urabá, Antioquia. ASAFRUT garantiza el origen y la calidad del producto.'}
              </p>
              
              {/* PRICES */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Precio por menor:</span>
                  <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '1.1rem' }}>
                     {selectedProduct.enPromocion && selectedProduct.precioPromocion ? (
                       <>
                         <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.9rem', marginRight: '8px' }}>
                           {formatPrice(selectedProduct.precio)}
                         </span>
                         <span style={{ color: 'var(--red)' }}>
                           {formatPrice(selectedProduct.precioPromocion)}
                         </span>
                       </>
                     ) : (
                       formatPrice(selectedProduct.precio)
                     )}
                    <small style={{ fontWeight: '400', fontSize: '0.8rem', color: '#64748b' }}> /kg</small>
                  </span>
                </div>
                
                {selectedProduct.cantidadMinimaMayorista && selectedProduct.precioMayorista && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Precio por mayor (≥{selectedProduct.cantidadMinimaMayorista}kg):</span>
                    <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.1rem' }}>
                       {formatPrice(selectedProduct.precioMayorista)}
                      <small style={{ fontWeight: '400', fontSize: '0.8rem', color: '#64748b' }}> /kg</small>
                    </span>
                  </div>
                )}
              </div>
              
              {/* PRODUCER DETAILS */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '600' }}>Productor</div>
                  <div style={{ fontWeight: '700', color: 'var(--text-dark)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {selectedProduct.productorNombre || selectedProduct.productor || selectedProduct.nombreProductor || 'Productor ASAFRUT'}
                    {selectedProduct.productorVerificado && (
                      <span style={{ background: '#e2f0d9', color: '#385723', padding: '1px 5px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '700', border: '1px solid #385723' }}>
                        Gold Supplier
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleContactProductor(selectedProduct)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  💬 Chat
                </button>
              </div>
              
              {/* BUTTONS */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => handleContactProductor(selectedProduct)}
                >
                  Contactar Productor
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1.5 }}
                  onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                  disabled={selectedProduct.stock <= 0}
                >
                  Agregar al Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
