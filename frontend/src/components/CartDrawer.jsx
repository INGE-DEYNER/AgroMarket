// src/components/CartDrawer.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import api from '../utils/api';

export default function CartDrawer({ isOpen, onClose }) {
  const { user } = useAuth();
  const { cart, removeFromCart, updateQuantity, total, count, clearCart } = useCart();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!user) {
      localStorage.setItem('carrito_pendiente', JSON.stringify(cart));
      onClose();
      navigate('/registro?redirect=/catalogo&accion=checkout');
      return;
    }
    try {
      // Crear pedidos individuales para cada producto en el carrito
      const requests = cart.map(item => 
        api.post('/pedidos', { productoId: item.id, cantidad: item.qty })
      );
      await Promise.all(requests);
      clearCart();
      onClose();
      // Redirigir a mis pedidos en el panel para proceder al pago
      navigate('/pedidos');
    } catch (err) {
      alert(t('catalog.alertCheckoutError', 'Error al procesar el pedido: ') + (err.message || t('errors.tryAgain', 'Inténtalo de nuevo.')));
    }
  };

  return (
    <>
      {/* Overlay oscuro */}
      <div 
        className={`cart-drawer-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose} 
      />
      
      {/* Panel lateral */}
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`} role="dialog" aria-label="Carrito de compras">
        <div className="cart-header">
          <div className="cart-header-title">
            {t('catalog.cartTitle', 'Mi carrito')}
            <span className="cart-items-count">
              ({count} {t('catalog.cartItems', 'items')})
            </span>
          </div>
          <button className="cart-close" onClick={onClose} aria-label="Cerrar carrito">✕</button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              {/* Ilustración SVG limpia y moderna */}
              <svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="1.5" className="cart-empty-svg">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                <path strokeLinecap="round" d="M12 9h4M14 7v4" />
              </svg>
              <div className="cart-empty-text">{t('catalog.emptyCart', 'Tu carrito está vacío')}</div>
              <button className="btn-keep-shopping-empty" onClick={onClose}>
                {t('catalog.startShopping', 'Comenzar a comprar')}
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const isWholesale = item.cantidadMinimaMayorista && item.precioMayorista && item.qty >= item.cantidadMinimaMayorista;
              const unitPrice = isWholesale ? Number(item.precioMayorista) : Number(item.precio);
              return (
                <div key={item.id} className="cart-item-row">
                  <img
                    src={item.imagenUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120'}
                    alt={item.nombre}
                    className="cart-item-thumb"
                  />
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.nombre}</div>
                    <div className="cart-item-price">
                      {isWholesale ? (
                        <>
                          <span className="price-old">
                            ${Number(item.precio).toLocaleString('es-CO')}/kg
                          </span>
                          <span className="price-wholesale">
                            ${unitPrice.toLocaleString('es-CO')}/kg
                          </span>
                        </>
                      ) : (
                        `$${unitPrice.toLocaleString('es-CO')}/kg`
                      )}
                    </div>
                    <div className="cart-qty-controls">
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.qty - 1)}>−</button>
                      <span className="qty-val">{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.qty + 1)}>+</button>
                    </div>
                  </div>
                  <button className="cart-item-del" onClick={() => removeFromCart(item.id)} aria-label="Eliminar item">✕</button>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal-row">
              <span>{t('catalog.subtotal', 'Subtotal')}</span>
              <span className="cart-footer-price">${total.toLocaleString('es-CO')}</span>
            </div>
            <div className="cart-subtotal-row">
              <span>{t('catalog.shippingEst', 'Envío estimado')}</span>
              <span className="cart-footer-price">$15.000</span>
            </div>
            <div className="cart-total-row">
              <span>{t('catalog.total', 'TOTAL')}</span>
              <span className="cart-footer-price-total">${(total + 15000).toLocaleString('es-CO')}</span>
            </div>
            <button className="btn-checkout" onClick={handleCheckout}>
              {t('catalog.checkoutBtn', 'Proceder al pago →')}
            </button>
            <button className="btn-keep-shopping" onClick={onClose}>
              {t('catalog.keepShopping', 'Seguir comprando')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
