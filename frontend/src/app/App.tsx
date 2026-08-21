import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/app/providers/AuthContext";
import { ToastProvider } from "@/app/providers/ToastContext";
import { CartProvider } from "@/app/providers/CartContext";
import { DivisaProvider } from "@/app/providers/DivisaContext";
import ProtectedRoute from "@/app/router/ProtectedRoute";
import NetworkError from "@/presentation/shared/components/NetworkError";

import Home from "@/presentation/features/home/pages/Home";
import Login from "@/presentation/features/auth/pages/Login";
import Registro from "@/presentation/features/auth/pages/Registro";
import VerificarCorreo from "@/presentation/features/auth/pages/VerificarCorreo";
import RecuperarContrasena from "@/presentation/features/auth/pages/RecuperarContrasena";
import RestablecerContrasena from "@/presentation/features/auth/pages/RestablecerContrasena";
import Catalogo from "@/presentation/features/product/pages/Catalogo";
import ChatbotSoporte from "@/presentation/shared/components/ChatbotSoporte";
import Footer from "@/presentation/shared/components/Footer";
import LoadingScreen from "@/presentation/shared/components/LoadingScreen";

// Lazy loaded components
const DashboardComprador = lazy(
  () => import("@/presentation/features/order/pages/DashboardComprador"),
);
const DashboardProductor = lazy(
  () => import("@/presentation/features/product/pages/DashboardProductor"),
);
const Admin = lazy(() => import("@/presentation/features/admin/pages/Admin"));
const Pedidos = lazy(
  () => import("@/presentation/features/order/pages/Pedidos"),
);
const Envios = lazy(
  () => import("@/presentation/features/shipping/pages/Envios"),
);
const Mensajeria = lazy(
  () => import("@/presentation/features/messaging/pages/Mensajeria"),
);
const Resenas = lazy(
  () => import("@/presentation/features/review/pages/Resenas"),
);
const Perfil = lazy(
  () => import("@/presentation/features/profile/pages/Perfil"),
);
const PagoPasarela = lazy(
  () => import("@/presentation/features/payment/pages/PagoPasarela"),
);
const SeleccionMetodoPago = lazy(
  () => import("@/presentation/features/payment/pages/SeleccionMetodoPago"),
);
const Productores = lazy(
  () => import("@/presentation/features/product/pages/Productores"),
);
const InfoLegal = lazy(
  () => import("@/presentation/features/about/pages/InfoLegal"),
);

const ComoFunciona = lazy(
  () => import("@/presentation/features/about/pages/ComoFunciona"),
);

const SobreAsafrut = lazy(
  () => import("@/presentation/features/about/pages/SobreAsafrut"),
);
const Ayuda = lazy(() => import("@/presentation/features/help/pages/Ayuda"));
const NotFound = lazy(() => import("@/presentation/shared/feedback/NotFound"));
const Checkout = lazy(
  () => import("@/presentation/features/order/pages/Checkout"),
);

function App() {
  return (
    <ToastProvider>
      <DivisaProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "100vh",
                }}
              >
                <main style={{ flex: 1 }} className="page-enter">
                  <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                      {/* Públicas */}
                      <Route
                        path="/"
                        element={<Navigate to="/home" replace />}
                      />
                      <Route path="/home" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/registro" element={<Registro />} />
                      <Route
                        path="/verificar-correo"
                        element={<VerificarCorreo />}
                      />
                      <Route
                        path="/verificar/:token"
                        element={<VerificarCorreo />}
                      />
                      <Route
                        path="/recuperar-contrasena"
                        element={<RecuperarContrasena />}
                      />
                      <Route
                        path="/restablecer-contrasena"
                        element={<RestablecerContrasena />}
                      />
                      <Route path="/catalogo" element={<Catalogo />} />
                      <Route path="/pago-pasarela" element={<PagoPasarela />} />
                      <Route path="/pago/seleccion" element={<SeleccionMetodoPago />} />
                      <Route path="/productores" element={<Productores />} />
                      <Route path="/terminos" element={<InfoLegal />} />
                      <Route path="/privacidad" element={<InfoLegal />} />
                      <Route path="/cookies" element={<InfoLegal />} />
                      <Route path="/como-funciona" element={<ComoFunciona />} />
                      <Route path="/sobre-asafrut" element={<SobreAsafrut />} />
                      <Route path="/ayuda" element={<Ayuda />} />

                      {/* Protegidas Generales */}
                      <Route
                        path="/perfil"
                        element={
                          <ProtectedRoute>
                            <Perfil />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/pedidos"
                        element={
                          <ProtectedRoute>
                            <Pedidos />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/envios"
                        element={
                          <ProtectedRoute>
                            <Envios />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/mensajeria"
                        element={
                          <ProtectedRoute>
                            <Mensajeria />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/resenas"
                        element={
                          <ProtectedRoute>
                            <Resenas />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/checkout"
                        element={
                          <ProtectedRoute>
                            <Checkout />
                          </ProtectedRoute>
                        }
                      />

                      {/* Dashboards por Rol */}
                      <Route
                        path="/dashboard-comprador"
                        element={
                          <ProtectedRoute
                            roles={["COMPRADOR", "ADMIN", "PRODUCTOR"]}
                          >
                            <DashboardComprador />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard-productor"
                        element={
                          <ProtectedRoute roles={["PRODUCTOR", "ADMIN"]}>
                            <DashboardProductor />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute roles={["ADMIN"]}>
                            <Admin />
                          </ProtectedRoute>
                        }
                      />

                      {/* 404 */}
                      <Route path="*" element={<NotFound />} />
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
      </DivisaProvider>
    </ToastProvider>
  );
}

export default App;


