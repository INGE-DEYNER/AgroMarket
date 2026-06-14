import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const CART_KEY = 'carrito_invitado';

export function useCart() {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCarrito();
  }, [user]);

  const cargarCarrito = async () => {
    setLoading(true);
    try {
      const carritoLocalStr = localStorage.getItem(CART_KEY);
      const carritoLocal = carritoLocalStr ? JSON.parse(carritoLocalStr) : [];

      if (!user) {
        setCart(carritoLocal);
      } else {
        // En un escenario real, aquí se llamaría a la API para obtener el carrito del servidor
        // y se fusionaría con carritoLocal si es necesario.
        // Para este ejemplo, simplificaremos asumiendo que el servidor maneja el estado
        // o sincronizando el local storage con la API si existe un endpoint.
        // Simulando que no hay endpoint de fusionar por ahora en el backend

        // Si hay carrito local, y el usuario se loguea, podríamos enviarlo al backend
        // if (carritoLocal.length > 0) {
        //   await api.post('/carrito/fusionar', { items: carritoLocal });
        //   localStorage.removeItem(CART_KEY);
        // }
        // const res = await api.get('/carrito');
        // setCart(res.data?.items || []);

        // Comportamiento simplificado: mantener el carrito en localStorage para el usuario también,
        // o vaciarlo si preferimos que el backend sea la única fuente de verdad.
        // Por ahora, fusionamos localmente y guardamos en localStorage como fallback.
        setCart(carritoLocal);
      }
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [cart, loading]);

  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...product, qty }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(CART_KEY);
  };

  const total = cart.reduce((sum, i) => {
    const isWholesale = i.cantidadMinimaMayorista && i.precioMayorista && i.qty >= i.cantidadMinimaMayorista;
    const currentPrice = isWholesale ? i.precioMayorista : i.precio;
    return sum + currentPrice * i.qty;
  }, 0);
  const count = cart.reduce((sum, i) => sum + i.qty, 0);

  return { cart, addToCart, removeFromCart, updateQty, clearCart, total, count, loading };
}
