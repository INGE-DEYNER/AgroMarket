import { createContext, useContext } from "react";

/**
 * Estado compartido del panel de ADMINISTRACIÓN.
 *
 * Las secciones se movieron a archivos propios, pero todas leen el mismo
 * estado que antes vivía en el padre (usuarios, pedidos, pagos, tickets,
 * formularios de perfil). Antes pasaba por el ámbito del componente; con el
 * shell único y el Outlet las secciones ya no son hijas del padre, así que
 * tiene que pasar por contexto.
 *
 * Se expone un único objeto y cada sección desestructura solo lo que usa.
 */
export const AdminContexto = createContext(null);

export function useAdminData() {
  const contexto = useContext(AdminContexto);
  if (!contexto) {
    throw new Error(
      "useAdminData debe usarse dentro de AdminContexto.Provider",
    );
  }
  return contexto;
}
