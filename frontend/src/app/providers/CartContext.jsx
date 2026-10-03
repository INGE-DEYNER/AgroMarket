// src/context/CartContext.jsx
import { useState, useEffect } from 'react';

import CartContext from "@/app/contexts/CartContext";
const CART_KEY = 'agromarket_cart';

// Normaliza un producto para el carrito aceptando tanto campos en español
// (nombre, precio, cantidadMinimaMayorista, precioMayorista, enPromocion,
// precioPromocion) como los que devuelve la API en inglés (name, price,
// minimumWholesaleQuantity, wholesalePrice, onPromotion, promotionPrice,
// availableQuantity). Sin esto, agregar desde el catálogo del dashboard
// dejaba precios undefined en el carrito (totales absurdos / NaN).
function normalizeProduct(product) {
  return {
    ...product,
    nombre: product.nombre ?? product.name ?? "Producto",
    precio:
      product.precio !== undefined && product.precio !== null
        ? product.precio
        : product.price,
    imagen: product.imagen ?? product.imageUrl ?? product.img ?? "",
    imagenUrl: product.imagenUrl ?? product.imageUrl ?? product.imagen ?? product.img ?? "",
    tipo: product.tipo ?? product.tipoFruta ?? product.fruitType ?? "",
    enPromocion: product.enPromocion ?? product.onPromotion ?? false,
    precioPromocion:
      product.precioPromocion ?? product.promotionPrice ?? null,
    cantidadMinimaMayorista:
      product.cantidadMinimaMayorista ??
      product.minimumWholesaleQuantity ??
      null,
    precioMayorista: product.precioMayorista ?? product.wholesalePrice ?? null,
    stock: product.stock ?? product.availableQuantity ?? 0,
  };
}

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
    const normalized = normalizeProduct(product);
    setCart((prev) => {
      const existing = prev.find((item) => item.id === normalized.id);
      if (existing) {
        return prev.map((item) =>
          item.id === normalized.id
            ? { ...item, qty: item.qty + qty }
            : item
        );
      }
      return [...prev, { ...normalized, qty }];
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

