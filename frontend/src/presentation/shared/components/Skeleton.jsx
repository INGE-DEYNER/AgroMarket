/*
 * Esqueletos de carga.
 *
 * POR QUE NO UN SPINNER: el texto "Cargando categorias..." aparece en un hueco
 * que despues se llena con una rejilla de 5-6 tarjetas altas. Cuando llegan,
 * el contenido empuja todo hacia abajo y el usuario ve como le saltan el
 * contenido bajo los ojos. Con un esqueleto de la altura real, el hueco ya
 * tiene el tamano correcto y al entrar las tarjetas no se mueve nada.
 *
 * El HTML no lleva texto: un "Cargando..." repetido 6 veces lo leeria un
 * lector de pantalla en voz alta. Se marca aria-busy y el texto real lo pone
 * el contenedor que ya lo tenia.
 */
export function Skeleton({ className = "", style }) {
  return <span className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

/* Tarjeta de categoria: circulo de foto + nombre. */
export function SkeletonCard({ circle = 110 }) {
  return (
    <div className="hm-cat-item skeleton-card" aria-hidden="true">
      <Skeleton
        className="skeleton-circle"
        style={{ width: circle + "px", height: circle + "px" }}
      />
      <Skeleton className="skeleton-line" style={{ width: "72%", height: "13px" }} />
    </div>
  );
}

/* Rejilla de categorias mientras llegan del backend. */
export function SkeletonCategorias({ n = 5 }) {
  return (
    <div className="hm-cat-grid" aria-busy="true" aria-live="polite">
      {Array.from({ length: n }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/* Tarjeta de producto: foto + dos lineas de texto. */
export function SkeletonProducto() {
  return (
    <div className="hm-cat-item skeleton-card" aria-hidden="true">
      <Skeleton
        className="skeleton-circle"
        style={{ width: 110, height: 110 }}
      />
      <Skeleton className="skeleton-line" style={{ width: "85%", height: "13px" }} />
      <Skeleton className="skeleton-line" style={{ width: "55%", height: "11px" }} />
    </div>
  );
}