import { useCallback, useEffect, useState } from "react";
import { FontScaleContext } from "./FontScaleContext";

const STORAGE_KEY = "agromarket-font-scale";

/*
 * Rango acotado a propósito. Por encima de 1.25 el sidebar deja de caber en
 * pantallas de 700px de alto y la zona "Mi perfil / Cerrar sesión" se corta;
 * por debajo de 0.85 el texto deja de ser legible.
 */
export const FONT_SCALE_MIN = 0.85;
export const FONT_SCALE_MAX = 1.25;
export const FONT_SCALE_STEP = 0.05;
export const FONT_SCALE_DEFAULT = 1;

function clampScale(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return FONT_SCALE_DEFAULT;
  const redondeado = Math.round(numeric * 100) / 100;
  return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, redondeado));
}

function readInitialScale() {
  if (typeof window === "undefined") return FONT_SCALE_DEFAULT;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) return FONT_SCALE_DEFAULT;
  return clampScale(stored);
}

/*
 * El valor viaja como `--font-scale` en el elemento <html>. Todas las medidas
 * de texto del shell se expresan como `calc(var(--fs-*) * var(--font-scale))`,
 * así que subir o bajar la fuente redimensiona menús, tarjetas y tablas de
 * forma proporcional. El layout no se rompe porque las medidas que dependen
 * de texto (alto de fila de menú, alto del topbar) también se derivan del
 * mismo token, y el nav tiene scroll interno para cuando no alcanzan.
 */
function applyScale(scale) {
  document.documentElement.style.setProperty(
    "--font-scale",
    String(scale),
  );
}

export default function FontScaleProvider({ children }) {
  const [fontScale, setFontScale] = useState(readInitialScale);

  useEffect(() => {
    applyScale(fontScale);
    window.localStorage.setItem(STORAGE_KEY, String(fontScale));
  }, [fontScale]);

  const increase = useCallback(() => {
    setFontScale((current) =>
      clampScale(Math.round((current + FONT_SCALE_STEP) * 100) / 100),
    );
  }, []);

  const decrease = useCallback(() => {
    setFontScale((current) =>
      clampScale(Math.round((current - FONT_SCALE_STEP) * 100) / 100),
    );
  }, []);

  const reset = useCallback(() => setFontScale(FONT_SCALE_DEFAULT), []);

  const setScale = useCallback((value) => setFontScale(clampScale(value)), []);

  const canIncrease = fontScale < FONT_SCALE_MAX;
  const canDecrease = fontScale > FONT_SCALE_MIN;

  return (
    <FontScaleContext.Provider
      value={{
        fontScale,
        setScale,
        increase,
        decrease,
        reset,
        canIncrease,
        canDecrease,
        min: FONT_SCALE_MIN,
        max: FONT_SCALE_MAX,
        step: FONT_SCALE_STEP,
      }}
    >
      {children}
    </FontScaleContext.Provider>
  );
}
