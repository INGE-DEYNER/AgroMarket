import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

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
import ProductoDetalle from "@/presentation/features/product/pages/ProductoDetalle";

import ChatbotSoporte from "@/presentation/shared/components/ChatbotSoporte";
import Footer from "@/presentation/shared/components/Footer";
import LoadingScreen from "@/presentation/shared/components/LoadingScreen";
import {
  Notificaciones,
  DireccionesGuardadas,
  CuponesPromociones,
  ListaDeseos,
  HistorialNavegacion,
  CentroAyudaDetallado,
  DevolucionesReembolsos,
  MetodosPagoGuardados,
  ModoOscuro,
} from "@/presentation/features/special";
import {
  RolesPermisos,
  ControlAcceso,
  DosFactorTOTP,
  SeguridadCuenta,
  EstadosEspeciales,
  MatrizPermisos,
  AuditoriaActividad,
  PrivacidadDatos,
  SellosConfianza,
} from "@/presentation/features/security";
import SecurityStatePage from "@/presentation/shared/feedback/SecurityStatePage";
// ============================================================
// COMPONENTES CARGADOS DE FORMA DIFERIDA
// ============================================================

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

// ============================================================
// APP
// ============================================================

function App() {
  return (
    <ToastProvider>
      <DivisaProvider>
        <Router>
          <AuthProvider>
            <CartProvider>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "100vh",
                  width: "100%",
                  maxWidth: "100%",
                }}
              >
                <main
                  style={{
                    flex: 1,
                  }}
                  className="page-enter"
                >
                  <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                      {/* ==================================================
                          RUTAS PÚBLICAS
                          NO REQUIEREN INICIAR SESIÓN
                         ================================================== */}

                      <Route path="/" element={<Home />} />

                      <Route path="/home" element={<Home />} />

                      <Route path="/login" element={<Login />} />

                      <Route path="/registro" element={<Registro />} />

                      <Route
                        path="/verificar-correo"
                        element={<VerificarCorreo />}
                      />

                      <Route
                        path="/verify-email"
                        element={<VerificarCorreo />}
                      />

                      <Route
                        path="/verify-email/:token"
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

                      <Route path="/producto/:id" element={<ProductoDetalle />} />

                      <Route path="/productores" element={<Productores />} />

                      <Route path="/terminos" element={<InfoLegal />} />

                      <Route path="/privacidad" element={<InfoLegal />} />

                      <Route path="/cookies" element={<InfoLegal />} />

                      <Route path="/como-funciona" element={<ComoFunciona />} />

                      <Route path="/sobre-asafrut" element={<SobreAsafrut />} />

                      <Route path="/ayuda" element={<Ayuda />} />

                      {/* ==================================================
                          RUTAS PRIVADAS GENERALES
                         ================================================== */}

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

                      {/* ==================================================
                          PAGOS
                          REQUIEREN AUTENTICACIÓN
                         ================================================== */}

                      <Route
                        path="/pago-pasarela"
                        element={
                          <ProtectedRoute>
                            <PagoPasarela />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/pago/seleccion"
                        element={
                          <ProtectedRoute>
                            <SeleccionMetodoPago />
                          </ProtectedRoute>
                        }
                      />

                      {/* ==================================================
                          DASHBOARD COMPRADOR
                         ================================================== */}

                      <Route
                        path="/dashboard-comprador"
                        element={
                          <ProtectedRoute
                            roles={[
                              "COMPRADOR",
                              "COMPRADOR_EMPRESA",
                              "BUYER",
                              "BUYER_COMPANY",
                              "ADMIN",
                            ]}
                          >
                            <DashboardComprador />
                          </ProtectedRoute>
                        }
                      />

                      {/* ==================================================
                          DASHBOARD PRODUCTOR
                         ================================================== */}

                      <Route
                        path="/dashboard-productor"
                        element={
                          <ProtectedRoute
                            roles={["PRODUCTOR", "PRODUCER", "ADMIN"]}
                          >
                            <DashboardProductor />
                          </ProtectedRoute>
                        }
                      />

                      {/* ==================================================
                          ADMINISTRACIÓN
                         ================================================== */}

                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute roles={["ADMIN"]}>
                            <Admin />
                          </ProtectedRoute>
                        }
                      />

                      {/* ==================================================
    PÁGINAS ESPECIALES DEL SISTEMA
   ================================================== */}

                      <Route
                        path="/especial/notificaciones"
                        element={
                          <ProtectedRoute>
                            <Notificaciones />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/especial/direcciones"
                        element={
                          <ProtectedRoute>
                            <DireccionesGuardadas />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/especial/cupones"
                        element={
                          <ProtectedRoute>
                            <CuponesPromociones />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/especial/deseos"
                        element={
                          <ProtectedRoute>
                            <ListaDeseos />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/especial/historial"
                        element={
                          <ProtectedRoute>
                            <HistorialNavegacion />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/especial/ayuda-detallada"
                        element={
                          <ProtectedRoute>
                            <CentroAyudaDetallado />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/especial/devoluciones"
                        element={
                          <ProtectedRoute>
                            <DevolucionesReembolsos />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/especial/pagos-guardados"
                        element={
                          <ProtectedRoute>
                            <MetodosPagoGuardados />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/especial/modo-oscuro"
                        element={
                          <ProtectedRoute>
                            <ModoOscuro />
                          </ProtectedRoute>
                        }
                      />
                      {/* ==================================================
    SEGURIDAD Y PERMISOS
   ================================================== */}

                      <Route
                        path="/seguridad/roles"
                        element={
                          <ProtectedRoute>
                            <RolesPermisos />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/seguridad/acceso"
                        element={
                          <ProtectedRoute>
                            <ControlAcceso />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/seguridad/2fa"
                        element={
                          <ProtectedRoute>
                            <DosFactorTOTP />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/seguridad/seguridad"
                        element={
                          <ProtectedRoute>
                            <SeguridadCuenta />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/seguridad/estados"
                        element={
                          <ProtectedRoute>
                            <EstadosEspeciales />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/seguridad/matriz"
                        element={
                          <ProtectedRoute>
                            <MatrizPermisos />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/seguridad/auditoria"
                        element={
                          <ProtectedRoute>
                            <AuditoriaActividad />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/seguridad/privacidad"
                        element={
                          <ProtectedRoute>
                            <PrivacidadDatos />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/seguridad/confianza"
                        element={
                          <ProtectedRoute>
                            <SellosConfianza />
                          </ProtectedRoute>
                        }
                      />

                      {/* ==================================================
    ESTADOS DE SEGURIDAD
   ================================================== */}

                      <Route
                        path="/estado/:code"
                        element={<SecurityStatePage />}
                      />
                      {/* ==================================================
                          404
                         ================================================== */}

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </main>

                {/* ========================================================
                    ELEMENTOS GLOBALES
                   ======================================================== */}

                <ChatbotSoporte />

                <AppFooter />

                <NetworkError />
              </div>
          </CartProvider>
        </AuthProvider>
      </Router>
      </DivisaProvider>
    </ToastProvider>
  );
}

// ============================================================
// FOOTER SEGÚN LA RUTA
// El footer compartido (compacto) solo se muestra en páginas
// públicas. Los dashboards/aplicación (comprador, productor,
// admin, especial, seguridad, perfil, pedidos, checkout, etc.)
// usan su propio pie de página y no deben heredar el global.
// ============================================================

const APP_FOOTER_HIDDEN_PREFIXES = [
  "/dashboard-comprador",
  "/dashboard-productor",
  "/admin",
  "/especial",
  "/seguridad",
  "/perfil",
  "/pedidos",
  "/envios",
  "/mensajeria",
  "/resenas",
  "/checkout",
  "/pago-pasarela",
  "/pago/",
];

function AppFooter() {
  const { pathname } = useLocation();

  const isAppRoute = APP_FOOTER_HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix),
  );

  return isAppRoute ? null : <Footer />;
}

export default App;
