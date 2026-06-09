window.__AGROMARKET_API_BASE__ = (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
)
  ? "http://localhost:8080/api"
  : "https://agromarket-vj8x.onrender.com/api";
