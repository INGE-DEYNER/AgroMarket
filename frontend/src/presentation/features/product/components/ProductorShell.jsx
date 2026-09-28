import { ProductorContexto } from "@/presentation/features/product/sections/ProductorContexto";

/**
 * Monta el shell del panel y expone el estado a las secciones por contexto.
 *
 * El estado sigue viviendo aquí (migrado desde el componente monolítico sin
 * tocar la lógica), pero ya no hay relación de ámbito con las secciones: cada
 * una se monta por ruta y lee de aquí con useProductorData().
 *
 * Se separa en este componente, y no en el padre de la ruta, para que el
 * shell no se re-monte al cambiar de sección: React Router mantiene esta
 * instancia viva y solo cambia el Outlet.
 */
export default function ProductorShell({ children, valor }) {
  return (
    <ProductorContexto.Provider value={valor}>
      {children}
    </ProductorContexto.Provider>
  );
}
