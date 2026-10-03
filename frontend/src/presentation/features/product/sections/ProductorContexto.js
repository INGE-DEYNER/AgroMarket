import { createContext, useContext } from "react";

/**
 * Estado compartido del dashboard del PRODUCTOR.
 *
 * Las secciones se movieron a archivos propios, pero todas leen el mismo
 * estado que antes vivía en el padre (productos, pedidos, RFQ, mensajes,
 * envíos, reseñas, formularios). Antes pasaba por el ámbito del componente;
 * con el shell único tiene que pasar por contexto, porque el padre queda
 * reducido al shell y no hay relación de ámbito con las secciones.
 */
export const ProductorContexto = createContext(null);

export function useProductorData() {
  const contexto = useContext(ProductorContexto);
  if (!contexto) {
    throw new Error(
      "useProductorData debe usarse dentro de ProductorContexto.Provider",
    );
  }
  return contexto;
}
