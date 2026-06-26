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
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        await refetchUser();
      } catch {
        localStorage.removeItem('token');
        setUser(null);
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
