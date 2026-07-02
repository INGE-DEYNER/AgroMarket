// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);
const CART_KEY = 'agromarket_cart';

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // Estado global para controlar si el drawer del carrito está abierto
  const [cartOpen, setCartOpen] = useState(false);

  // Persistir en localStorage
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  // Sincronizar entre tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === CART_KEY) {
        try {
          setCart(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {
          setCart([]);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addToCart = (product, qty = 1) => {
    if (!product || !product.id) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...prev, { ...product, qty }];
    });
    // Abrir automáticamente el carrito al agregar un producto
    setCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, qty: newQty } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(CART_KEY);
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => {
      const isWholesale = item.cantidadMinimaMayorista && item.precioMayorista && item.qty >= item.cantidadMinimaMayorista;
      let price = Number(item.precio);
      if (isWholesale) {
        price = Number(item.precioMayorista);
      } else if (item.enPromocion && item.precioPromocion) {
        price = Number(item.precioPromocion);
      }
      return sum + (price * item.qty);
    }, 0);
  };

  const getItemCount = () => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateQty: updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
        total: getTotal(),
        count: getItemCount(),
        cartOpen,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext debe usarse dentro de un CartProvider');
  }
  return context;
}

export default CartContext;
