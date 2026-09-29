import { createContext, useContext } from "react";

/**
 * Estado compartido del panel del COMPRADOR.
 *
 * Las secciones se movieron a archivos propios, pero todas leen el mismo
 * estado que antes vivía en el padre (pedidos, catálogo, facturas, mensajes,
 * formularios de perfil). Antes pasaba por el ámbito del componente; con el
 * shell único y el Outlet las secciones ya no son hijas del padre, así que
 * tiene que pasar por contexto.
 *
 * Se expone un único objeto y cada sección desestructura solo lo que usa.
 */
export const CompradorContexto = createContext(null);

export function useCompradorData() {
  const contexto = useContext(CompradorContexto);
  if (!contexto) {
    throw new Error(
      "useCompradorData debe usarse dentro de CompradorContexto.Provider",
    );
  }
  return contexto;
}
