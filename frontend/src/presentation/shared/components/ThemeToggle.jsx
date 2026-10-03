// src/presentation/shared/components/ThemeToggle.jsx
import { useTheme } from "@/app/contexts/ThemeContext.js";
import { useToast } from "@/app/hooks/useToast";
import "@/presentation/styles/microinteractions.css";

export const ThemeToggle = ({
  className = "",
  showLabel = false,
  variant = "icon",
}) => {
  const { darkMode, toggleTheme } = useTheme();
  const toast = useToast();

  const handleToggle = () => {
    toggleTheme();
    toast.success(`Tema ${darkMode ? "claro" : "oscuro"} activado`, 2000);
  };

  const label = darkMode ? "Activar tema claro" : "Activar tema oscuro";

  const icon = darkMode ? (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M21 14.1A8.3 8.3 0 0 1 9.9 3 8.4 8.4 0 1 0 21 14.1Z" />
    </svg>
  );

  const classes =
    variant === "button"
      ? `am-btn am-btn--secondary ${className}`.trim()
      : `theme-toggle ${className}`.trim();

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={classes}
      aria-label={label}
      title={label}
      aria-pressed={darkMode}
    >
      {icon}
      {showLabel && <span>{darkMode ? "Modo claro" : "Modo oscuro"}</span>}
    </button>
  );
};

export default ThemeToggle;
