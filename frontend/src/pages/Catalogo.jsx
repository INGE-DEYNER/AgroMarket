import { useState, useEffect } from 'react';
import useStyles from '../hooks/useStyles';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import { useCart } from '../hooks/useCart';
import api from '../utils/api';

const TIPOS = ['Banano', 'Piña', 'Mango', 'Maracuyá', 'Guanábana', 'Naranja', 'Coco', 'Limón'];

export default function Catalogo() {
  useStyles(["/css/styles.css","/css/catalogo.css"]);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, updateQty, total, count, clearCart } = useCart();

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get('/productos');
        setProductos(Array.isArray(data) ? data : data.content || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = productos.filter((p) => {
    const matchSearch = !search || p.nombre.toLowerCase().includes(search.toLowerCase()) || p.tipo?.toLowerCase().includes(search.toLowerCase());
    const matchTipo = !filtroTipo || p.tipo === filtroTipo;
    return matchSearch && matchTipo;
  });

  const toggleCart = () => setCartOpen(!cartOpen);

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
      alert('Error al procesar el pedido: ' + (err.message || 'Inténtalo de nuevo.'));
    }
  };

  return (
    <>
      <Navbar />

      <main style={{ padding: '28px 32px', maxWidth: '1280px', margin: '0 auto' }}>
        {/* HERO */}
        <div className="catalog-hero">
          <div>
            <div className="hero-title">Frutas tropicales<br />directo del campo 🌿</div>
            <div className="hero-sub">Productos frescos de los agricultores de ASAFRUT en Chigorodó, Antioquia.</div>
          </div>
          {count > 0 && (
            <button className="btn btn-primary" onClick={toggleCart}>
              🛒 Carrito ({count})
            </button>
          )}
        </div>

        {/* FILTERS */}
        <div className="filter-bar" style={{ marginBottom: '8px' }}>
          <input
            className="search-input"
            type="text"
            id="searchCatalog"
            placeholder="🔍 Buscar por nombre o tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-select"
            style={{ width: '160px' }}
            id="filtroTipo"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {TIPOS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* GRID */}
        <div className="products-grid" id="catalogGrid">
          {loading ? (
            <p>Cargando productos...</p>
          ) : filtered.length === 0 ? (
            <p>No se encontraron productos.</p>
          ) : (
            filtered.map((p) => (
              <div key={p.id} className="product-card">
                <img
                  src={p.imagenUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}
                  alt={p.nombre}
                  className="product-img"
                />
                <div className="product-info">
                  <h3 className="product-name">{p.nombre}</h3>
                  <div className="product-producer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    {p.productor || p.nombreProductor || '—'}
                  </div>
                  <div className="product-price">${Number(p.precio).toLocaleString('es-CO')}/kg</div>
                  <div className="product-meta">
                    <div className="product-rating">
                      ★★★★★
                      <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>
                        ({p.calificacion || '4.8'})
                      </span>
                    </div>
                    <div className="product-badge">{p.stock > 0 ? 'Disponible' : 'Agotado'}</div>
                  </div>
                  <button
                    className="btn btn-primary product-btn"
                    onClick={() => addToCart(p)}
                    disabled={p.stock <= 0}
                  >
                    Agregar al carrito
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="cart-drawer-overlay" id="cartOverlay" onClick={toggleCart}></div>
      )}
      <div className={`cart-drawer${cartOpen ? ' open' : ''}`} id="cartDrawer">
        <div className="cart-header">
          <h3>🛒 Mi carrito <span id="cartCountHeader" style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: '400' }}>({count} items)</span></h3>
          <button className="modal-close" onClick={toggleCart}>✕</button>
        </div>

        <div className="cart-content" id="cartItemsContainer">
          {cart.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem' }}>🛒</div>
              <div>Tu carrito está vacío</div>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                <img src={item.imagenUrl || 'https://via.placeholder.com/60'} alt={item.nombre} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600' }}>{item.nombre}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>${Number(item.precio).toLocaleString('es-CO')}/kg</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => updateQty(item.id, item.qty - 1)}>-</button>
                    <span>{item.qty}</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => removeFromCart(item.id)} style={{ marginLeft: 'auto', color: 'var(--red)' }}>✕</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer" id="cartFooter">
          <div className="cart-summary-row"><span>Subtotal</span><span id="cartSubtotal">${total.toLocaleString('es-CO')}</span></div>
          <div className="cart-summary-row"><span>Envío</span><span>$15.000</span></div>
          <div className="cart-summary-total"><span>TOTAL</span><span id="cartTotal">${(total + 15000).toLocaleString('es-CO')}</span></div>

          <div className="cart-actions">
            <button className="btn btn-primary btn-cta" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCheckout}>
              Proceder al pago →
            </button>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={toggleCart}>
              Seguir comprando
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
