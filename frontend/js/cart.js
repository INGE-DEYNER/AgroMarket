/**
 * cart.js
 * Manejo de carrito de compras global usando localStorage.
 */

const CART_KEY = 'agromarket_cart';

const Cart = {
  getItems: function() {
    const data = localStorage.getItem(CART_KEY);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      localStorage.removeItem(CART_KEY);
      return [];
    }
  },

  saveItems: function(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    this.updateCartBadge();
  },

  addItem: function(product, quantity) {
    const items = this.getItems();
    const existingIndex = items.findIndex(item => item.id === product.id);
    if (existingIndex > -1) {
      items[existingIndex].cantidad += quantity;
    } else {
      items.push({ ...product, cantidad: quantity });
    }
    this.saveItems(items);
  },

  removeItem: function(id) {
    let items = this.getItems();
    items = items.filter(item => item.id !== id);
    this.saveItems(items);
  },

  clearCart: function() {
    localStorage.removeItem(CART_KEY);
    this.updateCartBadge();
  },

  getTotal: function() {
    const items = this.getItems();
    return items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  },

  updateCartBadge: function() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    
    const items = this.getItems();
    const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
    
    if (totalItems > 0) {
      badge.textContent = totalItems;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
};

window.Cart = Cart;

export { Cart };
export default Cart;

// Update badge on initial load if element exists
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateCartBadge();
});
