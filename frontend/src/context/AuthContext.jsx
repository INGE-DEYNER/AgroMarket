import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import LoadingScreen from '../components/LoadingScreen';
import CompletarCuentaModal from '../components/CompletarCuentaModal';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeRole = (rawRole) => {
    if (!rawRole) return '';
    const r = rawRole.toUpperCase();
    if (r === 'ADMINISTRADOR' || r === 'ADMIN') return 'admin';
    if (r === 'PRODUCTOR') return 'productor';
    if (r === 'COMPRADOR') return 'comprador';
    return rawRole.toLowerCase();
  };

  const refetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await api.get('/usuarios/me');
      const userData = res.data || res;
      const normalizedUser = {
        ...userData,
        role: normalizeRole(userData.role || userData.rol?.name || userData.rol),
        email: userData.email || userData.correo,
      };
      setUser(normalizedUser);
    } catch (err) {
      // Solo limpiar sesión si el servidor explícitamente rechaza el token (401)
      // Errores de red, 500, etc. NO deben cerrar la sesión del usuario
      const is401 = err?.message?.includes('401') || err?.status === 401;
      if (is401) {
        localStorage.removeItem('token');
        localStorage.removeItem('agromarket_cart');
        setUser(null);
      }
      // Para otros errores: mantener el user actual si ya existe
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Verificar expiración client-side sin hacer request al servidor
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          localStorage.removeItem('agromarket_cart');
          setUser(null);
          setLoading(false);
          return;
        }
      } catch {
        // Token malformado — limpiar
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        await refetchUser();
      } catch (err) {
        const is401 = err?.status === 401 || err?.message?.includes('401');
        if (is401) {
          localStorage.removeItem('token');
          localStorage.removeItem('agromarket_cart');
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (userData, token) => {
    if (token) localStorage.setItem('token', token);
    const normalizedUser = {
      ...userData,
      role: normalizeRole(userData.role || userData.rol?.name || userData.rol),
      email: userData.email || userData.correo,
    };
    setUser(normalizedUser);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('agromarket_cart');
    setUser(null);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // No mostrar el modal para administradores (no necesitan KYC)
  const esAdmin = user?.role === 'admin' || user?.role === 'administrador';

  if (user && !user.cuentaCompleta && !esAdmin) {
    return <CompletarCuentaModal onComplete={() => refetchUser()} />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
