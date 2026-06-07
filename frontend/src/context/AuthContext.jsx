// File: frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import Auth, { getCurrentUser, isLoggedIn } from '../utils/auth.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (isLoggedIn()) {
        try {
          const profile = await Auth.loadPerfil();
          setUser(profile);
        } catch (err) {
          console.error("Failed to load user profile:", err);
          setUser(getCurrentUser());
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const loginUser = async (email, password) => {
    const result = await Auth.login(email, password);
    if (result && !result.twoFactorRequired) {
      setUser(getCurrentUser());
    }
    return result;
  };

  const logoutUser = () => {
    Auth.logout();
    setUser(null);
  };

  const value = {
    user,
    setUser,
    loading,
    login: loginUser,
    logout: logoutUser,
    isAuthenticated: !!user,
    role: user?.rol || null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
