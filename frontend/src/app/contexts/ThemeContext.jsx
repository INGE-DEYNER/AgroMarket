import { createContext, useContext, useState, useEffect } from 'react';

/**
 * ThemeContext - Contexto para gestionar el tema oscuro/claro
 * 
 * Estado:
 * - darkMode: booleano que indica si el tema oscuro está activado
 * - toggleTheme: función para alternar entre temas
 * 
 * Funcionalidad:
 * - Detecta preferencia del sistema (prefers-color-scheme)
 * - Guarda preferencia en localStorage
 * - Aplica clase 'dark' al elemento <html> para Tailwind CSS
 * 
 * Origen: Requisito nuevo - Cambio de tema en frontend
 */
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Obtener preferencia guardada o detectar preferencia del sistema
  const [darkMode, setDarkMode] = useState(() => {
    // 1. Verificar si hay preferencia guardada
    const savedMode = localStorage.getItem('agromarket-theme');
    if (savedMode) {
      return savedMode === 'dark';
    }
    
    // 2. Detectar preferencia del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Aplicar clase 'dark' a <html> cuando darkMode cambia
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    if (darkMode) {
      htmlElement.classList.add('dark');
      localStorage.setItem('agromarket-theme', 'dark');
    } else {
      htmlElement.classList.remove('dark');
      localStorage.setItem('agromarket-theme', 'light');
    }
    
    // Actualizar el data-attribute para estilos personalizados
    htmlElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Solo actualizar automáticamente si no hay preferencia guardada
      const savedMode = localStorage.getItem('agromarket-theme');
      if (!savedMode) {
        setDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  /**
   * Alterna entre tema oscuro y claro
   */
  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  /**
   * Establece un tema específico
   * @param {boolean} isDark - true para oscuro, false para claro
   */
  const setTheme = (isDark) => {
    setDarkMode(isDark);
  };

  const value = {
    darkMode,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook personalizado para usar el contexto de tema
 * @returns {Object} - { darkMode, toggleTheme, setTheme }
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
};
