import { CompradorContexto } from "@/presentation/features/order/sections/CompradorContexto";

/**
 * Monta el shell del panel y expone el estado a las secciones por contexto.
 *
 * El estado sigue viviendo aquí (migrado desde el componente monolítico sin
 * tocar la lógica), pero las secciones ya no son hijas del padre: cada una se
 * monta por ruta y lee de aquí con useCompradorData().
 */
export default function CompradorShell({ children, valor }) {
  return (
    <CompradorContexto.Provider value={valor}>{children}</CompradorContexto.Provider>
  );
}
