import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    // Escenario 1: 10 usuarios simultáneos durante 1 minuto
    { duration: '1m', target: 10 },
    // Escenario 2: Rampa y mantenimiento a 100 usuarios simultáneos durante 1 minuto
    { duration: '10s', target: 100 },
    { duration: '1m', target: 100 },
    // Escenario 3: Rampa y mantenimiento a 500 usuarios simultáneos durante 30 segundos
    { duration: '10s', target: 500 },
    { duration: '30s', target: 500 },
    // Escenario 4: Spike: Rápido aumento a 1000 usuarios en 10 segundos
    { duration: '10s', target: 1000 },
    { duration: '5s', target: 1000 },
    // Enfriamiento (Ramp down)
    { duration: '20s', target: 0 }
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // Menos del 1% de errores permitidos
    http_req_duration: ['p(95)<500'], // El 95% de los requests deben responder en menos de 500ms
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8080/api';

export default function () {
  const headers = { 'Content-Type': 'application/json' };

  // 1. GET /api/productos (Catálogo)
  let resProductos = http.get(`${BASE_URL}/productos`);
  check(resProductos, {
    'GET productos status is 200': (r) => r.status === 200,
  });
  sleep(1);

  // 2. POST /api/auth/login (Autenticación)
  let loginPayload = JSON.stringify({
    email: 'loadtest_user@agro-market.app',
    contrasena: 'WrongPassword123!',
  });
  let resLogin = http.post(`${BASE_URL}/auth/login`, loginPayload, { headers });
  check(resLogin, {
    'POST login returns 401 or 200': (r) => r.status === 401 || r.status === 200,
  });
  sleep(1);

  // 3. GET /api/usuarios/me (Perfil protegido)
  let resMe = http.get(`${BASE_URL}/usuarios/me`);
  check(resMe, {
    'GET me returns 401 (unauthorized)': (r) => r.status === 401,
  });
  sleep(1);

  // 4. POST /api/pedidos (Compra protegida)
  let pedidoPayload = JSON.stringify({
    productoId: 1,
    cantidad: 5
  });
  let resPedido = http.post(`${BASE_URL}/pedidos`, pedidoPayload, { headers });
  check(resPedido, {
    'POST pedidos returns 401 (unauthorized)': (r) => r.status === 401,
  });
  sleep(1);
}
