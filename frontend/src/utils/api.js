/**
 * api.js — Utilidad central de peticiones HTTP para AgroMarket
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

async function request(method, path, body) {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let requestBody;
  if (body !== undefined) {
    if (body instanceof FormData) {
      // Browser automatically sets Content-Type to multipart/form-data with correct boundary
      requestBody = body;
    } else {
      headers['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    ...(requestBody !== undefined ? { body: requestBody } : {}),
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
