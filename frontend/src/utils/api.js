/**
 * api.js — Utilidad central de peticiones HTTP para AgroMarket
 */

const API_BASE =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080/api'
    : 'https://agromarket-vj8x.onrender.com/api';

function getHeaders(isFormData = false) {
  const token = localStorage.getItem('token');
  return {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const isFormData = body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: getHeaders(isFormData),
    credentials: 'include',
    ...(body !== undefined ? { body: isFormData ? body : JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};

export default api;
export { API_BASE };
