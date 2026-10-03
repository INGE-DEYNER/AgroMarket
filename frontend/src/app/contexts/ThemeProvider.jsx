import { useCallback, useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext";

const STORAGE_KEY = "agromarket-theme";

function readInitialTheme() {
  if (typeof window === "undefined") return false;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "dark") return true;
  if (stored === "light") return false;

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function applyTheme(isDark) {
  const root = document.documentElement;
  const theme = isDark ? "dark" : "light";

  root.classList.toggle("dark", isDark);
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  root.setAttribute("data-theme", theme);

  document.body?.setAttribute("data-theme", theme);
}

export default function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(readInitialTheme);

  useEffect(() => {
    applyTheme(darkMode);
    window.localStorage.setItem(STORAGE_KEY, darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return undefined;

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return undefined;

    const handleSystemTheme = (event) => setDarkMode(event.matches);
    media.addEventListener?.("change", handleSystemTheme);
    return () => media.removeEventListener?.("change", handleSystemTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setDarkMode((current) => !current);
  }, []);

  const setTheme = useCallback((value) => {
    setDarkMode(value === true || value === "dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
