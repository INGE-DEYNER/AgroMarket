import { createContext, useContext } from "react";

export const FontScaleContext = createContext(null);

export function useFontScale() {
  const context = useContext(FontScaleContext);
  if (!context) {
    throw new Error("useFontScale debe usarse dentro de un FontScaleProvider");
  }
  return context;
}
