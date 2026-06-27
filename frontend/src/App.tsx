import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import NetworkError from './components/NetworkError';

import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro';
import VerificarCorreo from './pages/VerificarCorreo';
import RecuperarContrasena from './pages/RecuperarContrasena';
import RestablecerContrasena from './pages/RestablecerContrasena';
import Catalogo from './pages/Catalogo';
import ChatbotSoporte from './components/ChatbotSoporte';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';

// Lazy loaded components
const DashboardComprador = lazy(() => import('./pages/DashboardComprador'));
const DashboardProductor = lazy(() => import('./pages/DashboardProductor'));
const Admin = lazy(() => import('./pages/Admin'));
const Pedidos = lazy(() => import('./pages/Pedidos'));
const Envios = lazy(() => import('./pages/Envios'));
const Mensajeria = lazy(() => import('./pages/Mensajeria'));
const Resenas = lazy(() => import('./pages/Resenas'));
const Perfil = lazy(() => import('./pages/Perfil'));
const PagoPasarela = lazy(() => import('./pages/PagoPasarela'));
const Productores = lazy(() => import('./pages/Productores'));
const InfoLegal = lazy(() => import('./pages/InfoLegal'));

function App(): JSX.Element {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <main style={{ flex: 1 }} className="page-enter">
                <Suspense fallback={<LoadingScreen />}>
                  <Routes>
                    {/* Públicas */}
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<Registro />} />
                    <Route path="/verificar-correo" element={<VerificarCorreo />} />
                    <Route path="/verificar/:token" element={<VerificarCorreo />} />
                    <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
                    <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />
                    <Route path="/catalogo" element={<Catalogo />} />
                    <Route path="/pago-pasarela" element={<PagoPasarela />} />
                    <Route path="/productores" element={<Productores />} />
                    <Route path="/terminos" element={<InfoLegal />} />
                    <Route path="/privacidad" element={<InfoLegal />} />
                    <Route path="/cookies" element={<InfoLegal />} />

                    {/* Protegidas Generales */}
                    <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
                    <Route path="/pedidos" element={<ProtectedRoute><Pedidos /></ProtectedRoute>} />
                    <Route path="/envios" element={<ProtectedRoute><Envios /></ProtectedRoute>} />
                    <Route path="/mensajeria" element={<ProtectedRoute><Mensajeria /></ProtectedRoute>} />
                    <Route path="/resenas" element={<ProtectedRoute><Resenas /></ProtectedRoute>} />

                    {/* Dashboards por Rol */}
                    <Route
                      path="/dashboard-comprador"
                      element={
                        <ProtectedRoute roles={['COMPRADOR', 'ADMIN', 'PRODUCTOR']}>
                          <DashboardComprador />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard-productor"
                      element={
                        <ProtectedRoute roles={['PRODUCTOR', 'ADMIN']}>
                          <DashboardProductor />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute roles={['ADMIN']}>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />

                    {/* 404 */}
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </Routes>
                </Suspense>
              </main>
              <ChatbotSoporte />
              <Footer />
              <NetworkError />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
