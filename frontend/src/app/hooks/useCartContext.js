import { useContext } from "react";
import CartContext from "@/app/contexts/CartContext";

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext debe ser usado dentro de un CartProvider");
  }
  return context;
}