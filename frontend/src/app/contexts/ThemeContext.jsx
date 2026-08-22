import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "agromarket-theme";

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY);

    // Si el usuario ya eligió un tema, respetarlo.
    if (savedMode === "dark") {
      return true;
    }

    if (savedMode === "light") {
      return false;
    }

    // Primera visita: tema claro por defecto.
    return false;
  });

  useEffect(() => {
    const htmlElement = document.documentElement;

    if (darkMode) {
      htmlElement.classList.add("dark");
      htmlElement.setAttribute("data-theme", "dark");
      localStorage.setItem(STORAGE_KEY, "dark");
    } else {
      htmlElement.classList.remove("dark");
      htmlElement.setAttribute("data-theme", "light");
      localStorage.setItem(STORAGE_KEY, "light");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((previous) => !previous);
  };

  const setTheme = (isDark) => {
    setDarkMode(Boolean(isDark));
  };

  const value = {
    darkMode,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }

  return context;
};
