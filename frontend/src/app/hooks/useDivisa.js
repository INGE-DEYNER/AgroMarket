import { useContext } from "react";
import DivisaContext from "@/app/contexts/DivisaContext";

export function useDivisa() {
  const context = useContext(DivisaContext);
  if (!context) {
    throw new Error("useDivisa debe ser usado dentro de un DivisaProvider");
  }
  return context;
}