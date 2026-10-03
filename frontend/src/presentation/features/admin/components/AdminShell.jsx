import { AdminContexto } from "@/presentation/features/admin/sections/AdminContexto";

/**
 * Monta el shell del panel y expone el estado a las secciones por contexto.
 *
 * El estado sigue viviendo aquí (migrado desde el componente monolítico sin
 * tocar la lógica), pero las secciones ya no son hijas del padre: cada una se
 * monta por ruta y lee de aquí con useAdminData().
 */
export default function AdminShell({ children, valor }) {
  return <AdminContexto.Provider value={valor}>{children}</AdminContexto.Provider>;
}
