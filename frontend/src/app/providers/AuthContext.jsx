import { useState, useEffect, useCallback } from "react";
import api from "@/infrastructure/http/api";
import LoadingScreen from "@/presentation/shared/components/LoadingScreen";
import CompletarCuentaModal from "@/presentation/features/auth/components/CompletarCuentaModal";
import { useDivisa } from "@/app/hooks/useDivisa";

import AuthContext from "@/app/contexts/AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function normalizeRole(rawRole) {
    if (!rawRole) return "";

    const role = rawRole.toUpperCase();

    if (role === "ADMINISTRADOR" || role === "ADMIN") {
      return "admin";
    }

    if (role === "PRODUCTOR") {
      return "productor";
    }

    if (role === "COMPRADOR") {
      return "comprador";
    }

    return rawRole.toLowerCase();
  }

  const refetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const res = await api.get("/usuarios/me");
      const userData = res.data || res;

      const normalizedUser = {
        ...userData,
        role: normalizeRole(
          userData.role || userData.rol?.name || userData.rol,
        ),
        email: userData.email || userData.correo,
      };

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

    const normalizedUser = {
      ...userData,
      role: normalizeRole(userData.role || userData.rol?.name || userData.rol),
      email: userData.email || userData.correo,
    };

    setUser(normalizedUser);

    // Obtener inmediatamente el perfil completo.
    try {
      const res = await api.get("/usuarios/me");
      const fullUser = res.data || res;

      setUser({
        ...fullUser,
        role: normalizeRole(
          fullUser.role || fullUser.rol?.name || fullUser.rol,
        ),
        email: fullUser.email || fullUser.correo,
      });
    } catch (err) {
      console.error("Error fetching full user profile after login:", err);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Error cerrando sesión:", err);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("agromarket_cart");
    setUser(null);
  };

  const { divisaActual, cambiarDivisa, formatearPrecio } = useDivisa();

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
    </AuthContext.Provider>
  );
}
