import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/infrastructure/http/api";
import LoadingScreen from "@/presentation/shared/components/LoadingScreen";
import CompletarCuentaModal from "@/presentation/features/auth/components/CompletarCuentaModal";
import { useDivisa } from "@/app/hooks/useDivisa";

import AuthContext from "@/app/contexts/AuthContext";

// Helpers de normalización a nivel de módulo: son funciones puras que no
// dependen del estado del provider. Definirlas fuera del componente evita
// que react-hooks/exhaustive-deps las exija como dependencias de los
// useCallback internos.
function normalizeRole(rawRole) {
  if (!rawRole) return "";

  const role = rawRole.toUpperCase();

  if (role === "ADMINISTRADOR" || role === "ADMIN") {
    return "admin";
  }

  if (role === "PRODUCTOR" || role === "PRODUCER") {
    return "productor";
  }

  if (
    role === "COMPRADOR_EMPRESA" ||
    role === "BUYER_COMPANY" ||
    role === "COMPANY"
  ) {
    return "comprador_empresa";
  }

  return rawRole.toLowerCase();
}

/**
 * Normaliza la respuesta del backend (field names en inglés) a los
 * nombres en español que usan los componentes del frontend.
 * Mantiene compatibilidad con datos que ya vienen en español
 * (ej. del localStorage o de logins anteriores).
 */
function normalizeUser(userData) {
  if (!userData) return userData;

  const roleRaw =
    userData.role || userData.rol?.name || userData.rol;

  return {
    ...userData,
    // Nombre completo
    nombre: userData.firstName || userData.nombre,
    apellido: userData.lastName || userData.apellido,
    email: userData.email || userData.correo,
    telefono: userData.phone || userData.telefono,
    role: normalizeRole(roleRaw),
    rol: roleRaw,
    // Identificación
    tipoDocumento: userData.idType || userData.tipoDocumento,
    cedula: userData.idNumber || userData.cedula,
    numeroDocumento: userData.idNumber || userData.numeroDocumento,
    // Fecha de nacimiento
    fechaNacimiento: userData.birthDate || userData.fechaNacimiento,
    // Estado de cuenta
    cuentaCompleta:
      userData.accountComplete ?? userData.cuentaCompleta ?? false,
    // Divisa preferida
    divisaPreferida:
      userData.preferredCurrency || userData.divisaPreferida || "COP",
    // Empresa
    nombreEmpresa: userData.companyName || userData.nombreEmpresa,
    nit: userData.nit || userData.nit,
    esEmpresa: userData.isCompany ?? userData.esEmpresa ?? false,
    // Ubicación
    ubicacion: userData.location || userData.ubicacion,
    departamento: userData.department || userData.departamento,
    ciudad: userData.city || userData.ciudad,
    direccionCompleta:
      userData.fullAddress || userData.direccionCompleta,
    referencia: userData.addressReference || userData.referencia,
    codigoPostal: userData.postalCode || userData.codigoPostal,
    codigoPais: userData.countryCode || userData.codigoPais,
    fotoUrl: userData.photoUrl || userData.fotoUrl,
    // Verificaciones y ratings
    calificacion: userData.averageRating || userData.calificacion,
    verificado:
      userData.accountApproved ??
      userData.verifiedProducer ??
      userData.verificado ??
      false,
    cuentaBancaria: userData.bankAccount || userData.cuentaBancaria,
    fechaRegistro: userData.registrationDate || userData.fechaRegistro,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const INACTIVITY_TIMEOUT = 60000; // 1 minuto en milisegundos
  const WARNING_TIME = INACTIVITY_TIMEOUT - 5000; // 5 segundos antes

  const refetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const res = await api.get("/usuarios/me");
      const userData = res.data || res;

      const normalizedUser = normalizeUser(userData);

      setUser((prev) => ({
        ...normalizedUser,
        // No dejamos que un refetch "atrase" un cuentaCompleta que ya
        // confirmamos de forma optimista en el cliente (ver
        // handleCuentaCompletada más abajo).
        cuentaCompleta:
          normalizedUser.cuentaCompleta || prev?.cuentaCompleta || false,
      }));

      return normalizedUser;
    } catch (err) {
      // Solo limpiar la sesión si el servidor rechaza explícitamente
      // el token con HTTP 401.
      //
      // Errores de red, 500, timeout, etc. no deben cerrar
      // automáticamente la sesión del usuario.

      const is401 = err?.message?.includes("401") || err?.status === 401;

      if (is401) {
        localStorage.removeItem("token");
        localStorage.removeItem("agromarket_cart");
        setUser(null);
      }
    }
  }, []);

  // Fix del bug "Completar cuenta se queda pegado": en cuanto el modal
  // confirma que el PUT al backend respondió OK, desbloqueamos la UI de
  // inmediato marcando cuentaCompleta=true en el estado local, sin
  // esperar a que el backend devuelva ese mismo nombre de campo.
  // Igual sincronizamos con el servidor en segundo plano por si acaso.
  const handleCuentaCompletada = useCallback(
    async (datos) => {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              cuentaCompleta: true,
              tipoDocumento: datos?.tipoDocumento ?? prev.tipoDocumento,
              cedula: datos?.cedula ?? prev.cedula,
              fechaNacimiento: datos?.fechaNacimiento ?? prev.fechaNacimiento,
            }
          : prev,
      );

      try {
        await refetchUser();
      } catch {
        // Silencioso: ya desbloqueamos la UI de forma optimista arriba.
      }
    },
    [refetchUser],
  );

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      // Verificación client-side de la expiración del JWT.
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          localStorage.removeItem("agromarket_cart");
          setUser(null);
          setLoading(false);
          return;
        }
      } catch {
        // Token malformado.
        localStorage.removeItem("token");
        localStorage.removeItem("agromarket_cart");
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        await refetchUser();
      } catch (err) {
        const is401 = err?.status === 401 || err?.message?.includes("401");

        if (is401) {
          localStorage.removeItem("token");
          localStorage.removeItem("agromarket_cart");
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [refetchUser]);

    const login = async (userData, token) => {
    if (token) {
      localStorage.setItem("token", token);
    }

    const normalizedUser = normalizeUser(userData);

    setUser(normalizedUser);

    // Obtener inmediatamente el perfil completo.
    try {
      const res = await api.get("/usuarios/me");
      const fullUser = res.data || res;

      setUser(normalizeUser(fullUser));
    } catch (err) {
      console.error("Error fetching full user profile after login:", err);
    }
  };

  const logout = async () => {
    // Limpiamos el estado local de forma INMEDIATA y síncrona para que
    // ningún componente quede leyendo un usuario que ya no existe (esto
    // evita la pantalla en blanco que ocurría al navegar con user=null).
    localStorage.removeItem("token");
    localStorage.removeItem("agromarket_cart");
    setUser(null);

    // El cierre de sesión en el backend es best-effort: si falla (red,
    // token expirado, endpoint inexistente) no debe bloquear el logout
    // local ni dejar la UI en un estado inconsistente.
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Error cerrando sesión:", err);
    } finally {
      // Redirigir a home después de logout
      navigate("/");
    }
  };

  const { divisaActual, cambiarDivisa, formatearPrecio } = useDivisa();

  // Efecto para manejar expiración de sesión por inactividad
  useEffect(() => {
    // Función para resetear el temporizador
    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      setShowWarning(false);

      // Configurar temporizador de advertencia
      warningTimerRef.current = setTimeout(() => {
        setShowWarning(true);
      }, WARNING_TIME);

      // Configurar temporizador de expiración
      timerRef.current = setTimeout(() => {
        setShowWarning(false);
        logout();
      }, INACTIVITY_TIMEOUT);
    };

    // Función para manejar eventos de actividad
    const handleActivity = () => {
      if (user && !showWarning) {
        resetTimer();
      }
    };

    // Listeners de eventos de actividad
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart", "mousewheel"];
    
    if (user) {
      // Añadir event listeners
      events.forEach(event => {
        window.addEventListener(event, handleActivity);
      });

      // Iniciar temporizador
      resetTimer();
    }

    // Limpiar al desmontar o cuando el usuario cambia
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, [user, showWarning, logout]);

  // Efecto para la divisa preferida
  useEffect(() => {
    if (user && user.divisaPreferida) {
      if (divisaActual !== user.divisaPreferida) {
        cambiarDivisa(user.divisaPreferida);
      }
    }
  }, [user, cambiarDivisa, divisaActual]);

  const formatPrice = (copPrice) => {
    return formatearPrecio(copPrice);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // Los administradores no necesitan completar el proceso KYC.
  const esAdmin = user?.role === "admin" || user?.role === "administrador";

  if (user && !user.cuentaCompleta && !esAdmin) {
    return <CompletarCuentaModal onComplete={handleCuentaCompletada} />;
  }

  // Modal de advertencia de sesión a punto de expirar
  const SessionWarningModal = () => (
    <div className="modal-overlay open" style={{ zIndex: 9999 }}>
      <div className="modal" style={{ maxWidth: "400px", textAlign: "center" }}>
        <h3 style={{ color: "#dc2626", marginBottom: "16px" }}>⏰ Sesión a punto de expirar</h3>
        <p style={{ marginBottom: "20px" }}>
          Su sesión expirará en 5 segundos por inactividad.
          <br />
          ¿Desea mantener la sesión activa?
        </p>
        <button
          id="keep-session"
          className="btn btn-primary"
          style={{ marginRight: "10px" }}
          onClick={() => {
            setShowWarning(false);
            // Reiniciar el temporizador
            if (timerRef.current) {
              clearTimeout(timerRef.current);
            }
            if (warningTimerRef.current) {
              clearTimeout(warningTimerRef.current);
            }
            // Configurar nuevos temporizadores
            warningTimerRef.current = setTimeout(() => {
              setShowWarning(true);
            }, WARNING_TIME);
            timerRef.current = setTimeout(() => {
              setShowWarning(false);
              logout();
            }, INACTIVITY_TIMEOUT);
          }}
        >
          Sí, mantener sesión
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setShowWarning(false);
            logout();
          }}
        >
          No, cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        setUser,
        refetchUser,
        divisaActual,
        setDivisaActual: cambiarDivisa,
        formatPrice,
      }}
    >
      {children}
      {showWarning && <SessionWarningModal />}
    </AuthContext.Provider>
  );
}
