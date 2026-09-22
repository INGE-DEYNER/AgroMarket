import { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { AuthProvider } from "@/app/providers/AuthContext";
import { ToastProvider } from "@/app/providers/ToastContext";
import { CartProvider } from "@/app/providers/CartContext";
import { DivisaProvider } from "@/app/providers/DivisaContext";
import ProtectedRoute from "@/app/router/ProtectedRoute";

import NetworkError from "@/presentation/shared/components/NetworkError";
import MaintenanceLayer from "@/presentation/shared/components/MaintenanceLayer";
import Icon from "@/presentation/shared/components/Icon";

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

/* ============================================================
   COMPONENTES CARGADOS DE FORMA DIFERIDA
   ============================================================ */

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

/* ============================================================
   APP
   ============================================================ */

function App() {
  const [mountError, setMountError] = useState(false);

  useEffect(() => {
    return () => {
      setMountError(false);
    };
  }, []);

  if (mountError) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          textAlign: "center",
          background: "var(--surface-1, #0b1b12)",
          color: "var(--text-1, #e5e7eb)",
        }}
      >
        <div
          style={{
            color: "#dc2626",
            marginBottom: "20px",
          }}
        >
          <Icon name="alert" size={48} />
        </div>

        <h1
          style={{
            color: "var(--danger, #dc2626)",
            marginBottom: "10px",
          }}
        >
          Error al cargar la aplicación
        </h1>

        <p
          style={{
            color: "var(--muted, #9ca3af)",
            marginBottom: "20px",
            maxWidth: "400px",
          }}
        >
          No se pudo montar el shell de la app. Recarga para intentar de nuevo.
        </p>

        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "12px 24px",
            background: "var(--primary, #1a5c2a)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <ToastProvider>
      <DivisaProvider>
        <Router>
          <AuthProvider
            onError={() => {
              setMountError(true);
            }}
          >
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

                      <Route
                        path="/producto/:id"
                        element={<ProductoDetalle />}
                      />

                      <Route path="/productores" element={<Productores />} />

                      <Route path="/terminos" element={<InfoLegal />} />

                      <Route path="/privacidad" element={<InfoLegal />} />

                      <Route path="/cookies" element={<InfoLegal />} />

                      <Route path="/como-funciona" element={<ComoFunciona />} />

                      <Route path="/sobre-asafrut" element={<SobreAsafrut />} />

                      <Route path="/ayuda" element={<Ayuda />} />

                      {/* ==================================================
                          RUTAS PRIVADAS
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
                          ADMIN
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
                          PÁGINAS ESPECIALES
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
                          SEGURIDAD
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

                <ChatbotSoporte />

                <AppFooter />

                <NetworkError />

                <MaintenanceLayer />
              </div>
            </CartProvider>
          </AuthProvider>
        </Router>
      </DivisaProvider>
    </ToastProvider>
  );
}

/* ============================================================
   RUTAS DONDE NO DEBE APARECER EL FOOTER GLOBAL
   ============================================================ */

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
  "/pago",
];

function AppFooter() {
  const location = useLocation();

  const hidden = APP_FOOTER_HIDDEN_PREFIXES.some((prefix) =>
    location.pathname.startsWith(prefix),
  );

  if (hidden) {
    return null;
  }

  return <Footer />;
}

export default App;
