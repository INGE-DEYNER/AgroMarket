import { useCallback, useEffect, useState } from "react";
import SpecialSystemShell from "@/presentation/features/special/components/SpecialSystemShell";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  leerHistorial,
  limpiarHistorial,
  agruparPorDia,
} from "@/application/support/navigationHistory";
import Icon from "@/presentation/shared/components/Icon";

export default function HistorialNavegacion() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState(() =>
    agruparPorDia(leerHistorial()),
  );

  // Refresca al volver a la pestaña: otro flujo pudo registrar visitas.
  useEffect(() => {
    const alVolver = () => setGrupos(agruparPorDia(leerHistorial()));
    window.addEventListener("focus", alVolver);
    return () => window.removeEventListener("focus", alVolver);
  }, []);

  const vaciar = useCallback(() => {
    limpiarHistorial();
    setGrupos(agruparPorDia([]));
  }, []);

  const total = Array.from(grupos.values()).reduce(
    (suma, items) => suma + items.length,
    0,
  );

  return (
    <SpecialSystemShell activeKey="historial">
      <div className="special-heading">
        <div>
          <h1>{t("special.navigationHistory", "Historial de navegación")}</h1>
          <p>
            {t(
              "special.navigationHistorySub",
              "Revisa los productos que has visitado recientemente.",
            )}
          </p>
        </div>
        {total > 0 && (
          <button type="button" className="special-link-button" onClick={vaciar}>
            {t("special.clearHistory", "Limpiar historial")}
          </button>
        )}
      </div>

      {total === 0 ? (
        <div className="special-empty">
          <p>{t("special.emptyHistory", "Tu historial está vacío.")}</p>
          <button
            type="button"
            className="special-secondary-action"
            onClick={() => navigate("/catalogo")}
          >
            {t("special.viewFullHistory", "Ver catálogo")}
          </button>
        </div>
      ) : (
        Array.from(grupos.entries()).map(([dia, items]) => (
          <section className="history-section" key={dia}>
            <h2>{dia}</h2>
            <div className="history-grid">
              {items.map((p) => (
                <article
                  className="history-card"
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/producto/${p.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/producto/${p.id}`);
                    }
                  }}
                >
                  <div aria-hidden="true">
                    <Icon name="package" size={26} />
                  </div>
                  <strong>{p.nombre}</strong>
                  {p.unidad && <span>{p.unidad}</span>}
                  <b>{`$${p.precio.toLocaleString("es-CO")} COP`}</b>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </SpecialSystemShell>
  );
}
