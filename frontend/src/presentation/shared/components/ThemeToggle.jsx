import { useTheme } from "@/app/contexts/ThemeContext";

export const ThemeToggle = ({
  className = "",
  showLabel = false,
  variant = "icon",
}) => {
  const { darkMode, toggleTheme } = useTheme();

  const handleToggle = () => {
    toggleTheme();
  };

  const getIcon = () => {
    if (darkMode) {
      return (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586 8 8 0 01-1.414-1.414z" />
        </svg>
      );
    }

    return (
      <svg
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
      </svg>
    );
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`
          px-4 py-2
          rounded-lg
          transition-all
          duration-200
          ${
            darkMode
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50"
          }
          ${className}
        `}
        aria-label={`Cambiar a tema ${darkMode ? "claro" : "oscuro"}`}
        title={`Cambiar a tema ${darkMode ? "claro" : "oscuro"}`}
      >
        <span className="flex items-center gap-2">
          {getIcon()}
          {showLabel && <span>{darkMode ? "Modo Claro" : "Modo Oscuro"}</span>}
        </span>
      </button>
    );
  }

  if (variant === "switch") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`
          p-2
          rounded-full
          transition-all
          duration-200
          hover:scale-110
          ${
            darkMode
              ? "bg-gray-700 text-yellow-400"
              : "bg-gray-200 text-blue-600"
          }
          ${className}
        `}
        aria-label={`Cambiar a tema ${darkMode ? "claro" : "oscuro"}`}
        title={`Cambiar a tema ${darkMode ? "claro" : "oscuro"}`}
      >
        {getIcon()}

        {showLabel && (
          <span className="ml-2">{darkMode ? "Claro" : "Oscuro"}</span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`
        theme-toggle
        p-2
        rounded-full
        transition-all
        duration-200
        ${className}
      `}
      aria-label={`Cambiar a tema ${darkMode ? "claro" : "oscuro"}`}
      title={`Cambiar a tema ${darkMode ? "claro" : "oscuro"}`}
    >
      {getIcon()}
    </button>
  );
};

export default ThemeToggle;
