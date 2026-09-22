import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from "@/presentation/shared/components/Icon";
import { useToast } from "@/app/hooks/useToast";

const LANGUAGES = [
  {
    code: "es",
    label: "Español",
    flag: "🇪🇸",
    available: true,
  },
  {
    code: "en",
    label: "English",
    flag: "🇺🇸",
    available: true,
  },
  {
    code: "pt",
    label: "Português",
    flag: "🇧🇷",
    available: false,
  },
  {
    code: "fr",
    label: "Français",
    flag: "🇫🇷",
    available: false,
  },
  {
    code: "de",
    label: "Deutsch",
    flag: "🇩🇪",
    available: false,
  },
  {
    code: "zh",
    label: "中文",
    flag: "🇨🇳",
    available: false,
  },
  {
    code: "ar",
    label: "العربية",
    flag: "🇸🇦",
    available: false,
  },
];

function normalizeLanguage(language) {
  if (!language) {
    return "es";
  }

  return language.split("-")[0].toLowerCase();
}

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [changing, setChanging] = useState(false);

  const dropdownRef = useRef(null);

  const activeLanguage = normalizeLanguage(
    i18n.resolvedLanguage || i18n.language,
  );

  const currentLang =
    LANGUAGES.find((language) => language.code === activeLanguage) ||
    LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = activeLanguage;
  }, [activeLanguage]);

  const selectLanguage = async (code) => {
    const normalizedCode = normalizeLanguage(code);

    if (
      changing ||
      normalizedCode === activeLanguage ||
      !LANGUAGES.some((language) => language.code === normalizedCode)
    ) {
      setIsOpen(false);
      return;
    }

    const selected = LANGUAGES.find(
      (language) => language.code === normalizedCode,
    );

    // Idiomas aún no disponibles: mostrar mensaje informativo y NO cambiar
    // el idioma actual. Estarán disponibles en la próxima actualización.
    if (!selected?.available) {
      toast?.warning(
        t(
          "languageSwitcher.notAvailable",
          "Lo sentimos, actualmente esta opción no está disponible. En la siguiente actualización estará disponible un nuevo idioma.",
        ),
        6000,
      );
      setIsOpen(false);
      return;
    }

    try {
      setChanging(true);

      await i18n.changeLanguage(normalizedCode);

      // Persistencia explícita
      localStorage.setItem("i18nextLng", normalizedCode);

      setIsOpen(false);
    } catch (error) {
      console.error(
        `No se pudo cambiar el idioma a "${normalizedCode}":`,
        error,
      );
    } finally {
      setChanging(false);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="language-switcher"
      style={{
        position: "relative",
        display: "inline-flex",
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        disabled={changing}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t("languageSwitcher.selectLanguage", "Seleccionar idioma")}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          minWidth: "82px",
          height: "40px",
          padding: "0 10px",
          background: "var(--color-surface, #ffffff)",
          color: "var(--color-text-primary, #1f2937)",
          border: "1px solid var(--color-border, #e5e7eb)",
          borderRadius: "8px",
          cursor: changing ? "wait" : "pointer",
          fontSize: "14px",
          fontWeight: "600",
          opacity: changing ? 0.7 : 1,
          transition: "all 0.2s ease",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            fontSize: "18px",
            lineHeight: 1,
          }}
        >
          {currentLang.flag}
        </span>

        <span>{currentLang.code.toUpperCase()}</span>

        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={t("languageSwitcher.availableLanguages", "Idiomas disponibles")}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: "170px",
            padding: "6px",
            background: "var(--color-surface, #ffffff)",
            border: "1px solid var(--color-border, #e5e7eb)",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.12)",
            zIndex: 10000,
          }}
        >
          {LANGUAGES.map((language) => {
            const selected = activeLanguage === language.code;

            return (
              <button
                key={language.code}
                type="button"
                role="option"
                aria-selected={selected}
                aria-disabled={!language.available}
                disabled={changing}
                onClick={() => selectLanguage(language.code)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  minHeight: "40px",
                  padding: "8px 10px",
                  border: "none",
                  borderRadius: "7px",
                  background: selected
                    ? "var(--color-primary-light, #d1fae5)"
                    : "transparent",
                  color: selected
                    ? "var(--color-primary-dark, #065f46)"
                    : language.available
                      ? "var(--color-text-primary, #1f2937)"
                      : "var(--color-text-muted, #9ca3af)",
                  cursor: changing
                    ? "wait"
                    : language.available
                      ? "pointer"
                      : "not-allowed",
                  fontSize: "14px",
                  fontWeight: selected ? "700" : "500",
                  textAlign: "left",
                  opacity: language.available ? 1 : 0.7,
                }}
                onMouseEnter={(e) => {
                  if (language.available && !selected) {
                    e.currentTarget.style.background =
                      "var(--color-surface-hover, #f3f4f6)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = selected
                    ? "var(--color-primary-light, #d1fae5)"
                    : "transparent";
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    fontSize: "18px",
                    lineHeight: 1,
                  }}
                >
                  {language.flag}
                </span>

                <span>{language.label}</span>

                {!language.available && !selected && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "11px",
                      fontWeight: "600",
                      padding: "2px 7px",
                      borderRadius: "999px",
                      background: "var(--color-surface-hover, #f3f4f6)",
                      color: "var(--color-text-muted, #6b7280)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("languageSwitcher.soon", "Próximamente")}
                  </span>
                )}

                {selected && (
                  <span
                    aria-hidden="true"
                    style={{
                      marginLeft: "auto",
                      fontWeight: "700",
                    }}
                  >
                    <Icon name="check" size={14} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
