// File: frontend/src/hooks/useCart.js
import { useState, useCallback, useEffect } from 'react';

const CART_KEY = 'am_cart';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function useCart() {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = useCallback((product, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], cantidad: updated[idx].cantidad + qty };
        return updated;
      }
      return [...prev, { ...product, cantidad: qty }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id, change) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx < 0) return prev;
      const newQty = prev[idx].cantidad + change;
      if (newQty <= 0) return prev.filter((i) => i.id !== id);
      const updated = [...prev];
      updated[idx] = { ...updated[idx], cantidad: newQty };
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + (i.precio || 0) * i.cantidad, 0);
  const count = items.reduce((sum, i) => sum + i.cantidad, 0);

  return { items, addItem, removeItem, updateQty, clearCart, total, count };
}
