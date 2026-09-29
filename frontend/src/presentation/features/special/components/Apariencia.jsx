import { useTranslation } from "react-i18next";
import { useTheme } from "@/app/contexts/ThemeContext.js";
import { useFontScale } from "@/app/contexts/FontScaleContext";
import LanguageSwitcher from "@/presentation/shared/components/LanguageSwitcher";
import Icon from "@/presentation/shared/components/Icon";

/*
 * APARIENCIA — subsección de Configuración en los tres paneles.
 *
 * Antes esto era la página /especial/modo-oscuro: una maqueta visual con
 * componentes de ejemplo (tarjeta, tabla, botones) que sacaba al usuario del
 * panel. Aquí van los controles REALES, que es lo que la gente viene a
 * cambiar:
 *
 *   - Tema claro/oscuro, con el estado real (aria-pressed)
 *   - Tamaño del texto, con la misma fuente que el shell
 *   - Idioma
 *
 * El ajuste de tamaño de texto se quitó del topbar a petición del usuario
 * (el navegador ya lo ofrece con Ctrl -/+); sigue existiendo como
 * funcionalidad y vive aquí, que es donde corresponde.
 */
export default function Apariencia() {
  const { t } = useTranslation();
  const { darkMode, setTheme } = useTheme();
  const {
    fontScale,
    increase,
    decrease,
    reset,
    canIncrease,
    canDecrease,
    isDefault,
  } = useFontScale();

  const porcentaje = Math.round(fontScale * 100);

  return (
    <div className="ds-config-section">
      <div className="ds-config-card">
        <div className="ds-config-card__head">
          <span className="ds-config-card__icon" aria-hidden="true">
            <Icon name={darkMode ? "moon" : "sun"} size={18} />
          </span>
          <div>
            <h2>{t("paneles.apariencia.tema", "Tema")}</h2>
            <p>
              {darkMode
                ? t("paneles.apariencia.oscuroActivo", "Oscuro activo")
                : t("paneles.apariencia.claroActivo", "Claro activo")}
            </p>
          </div>
        </div>

        <div
          className="ds-config-toggle"
          role="group"
          aria-label={t("paneles.apariencia.tema", "Tema")}
        >
          <button
            type="button"
            className={!darkMode ? "active" : ""}
            onClick={() => setTheme("light")}
            aria-pressed={!darkMode}
          >
            <Icon name="sun" size={15} />
            {t("paneles.apariencia.claro", "Claro")}
          </button>
          <button
            type="button"
            className={darkMode ? "active" : ""}
            onClick={() => setTheme("dark")}
            aria-pressed={darkMode}
          >
            <Icon name="moon" size={15} />
            {t("paneles.apariencia.oscuro", "Oscuro")}
          </button>
        </div>
      </div>

      <div className="ds-config-card">
        <div className="ds-config-card__head">
          <span className="ds-config-card__icon" aria-hidden="true">
            <Icon name="sliders" size={18} />
          </span>
          <div>
            <h2>{t("paneles.apariencia.tamano", "Tamaño del texto")}</h2>
            <p>
              {t(
                "paneles.apariencia.tamanoActual",
                "Tamaño actual: {{pct}}%",
                { pct: porcentaje },
              )}
            </p>
          </div>
        </div>

        <div
          className="ds-config-toggle"
          role="group"
          aria-label={t("paneles.apariencia.tamano", "Tamaño del texto")}
        >
          <button
            type="button"
            onClick={decrease}
            disabled={!canDecrease}
            aria-label={t("paneles.apariencia.reducir", "Reducir texto")}
          >
            <span aria-hidden="true">A−</span>
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={isDefault}
            aria-label={t("paneles.apariencia.restablecer", "Restablecer")}
            title={
              isDefault
                ? undefined
                : t("paneles.apariencia.restablecer", "Restablecer")
            }
          >
            {porcentaje}%
          </button>
          <button
            type="button"
            onClick={increase}
            disabled={!canIncrease}
            aria-label={t("paneles.apariencia.aumentar", "Aumentar texto")}
          >
            <span aria-hidden="true">A+</span>
          </button>
        </div>
      </div>

      <div className="ds-config-card">
        <div className="ds-config-card__head">
          <span className="ds-config-card__icon" aria-hidden="true">
            <Icon name="globe" size={18} />
          </span>
          <div>
            <h2>{t("paneles.apariencia.idioma", "Idioma")}</h2>
            <p>
              {t(
                "paneles.apariencia.idiomaSub",
                "Elige el idioma de la plataforma.",
              )}
            </p>
          </div>
        </div>
        <LanguageSwitcher />
      </div>
    </div>
  );
}
