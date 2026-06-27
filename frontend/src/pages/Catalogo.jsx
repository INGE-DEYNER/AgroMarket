// src/pages/Catalogo.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { useSecureParams } from '../utils/useSecureParams';
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
  const { user } = useAuth();
  const [params, setParams] = useSecureParams();

  const { addToCart, count, cartOpen, setCartOpen } = useCart();

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
                      {p.stock > 0 ? t('catalog.available', 'Disponible') : t('catalog.soldOut', 'Agotado')}
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
                           Gold Supplier
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
                        className={`catalog-card-add ${addedStates[p.id] ? 'added' : ''}`}
                        onClick={() => handlePedirAhora(p)}
                        disabled={p.stock <= 0}
                      >
                        {addedStates[p.id] ? '✓ Agregado' : t('catalog.addToCart', '+ Agregar')}
                      </button>
                    </div>
                  </div>
                </div>
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
    </>
  );
}
