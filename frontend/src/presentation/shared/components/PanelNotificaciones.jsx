import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/infrastructure/http/api";
import Icon from "@/presentation/shared/components/Icon";
import {
  TIPO_NOTIFICACION,
  tiempoRelativo,
} from "@/infrastructure/normalizar";

/**
 * Campana de notificaciones con panel desplegable.
 *
 * Antes la campana navegan a /especial/notificaciones y sacaba al
 * administrador del panel. Ahora abre una pila de avisos en el mismo
 * sitio, al estilo de las notificaciones agrupadas de iOS: cada aviso es
 * una tarjeta translúcida con icono, categoría, resumen y hora.
 *
 * Los datos vienen del mismo endpoint que la página completa
 * (GET /notifications/user/{id}), así que el panel y la página nunca se
 * contradicen. Al marcar una como leída se refresca la lista en el sitio.
 *
 * `rutaVerTodas` permite que cada rol apunte a su propia sección de
 * Configuración. Antes el enlace iba siempre a /especial/notificaciones, que
 * además sacaba al usuario de los dashboards.
 */
export default function PanelNotificaciones({
  userId,
  limite = 6,
  rutaVerTodas = "/especial/notificaciones",
}) {
  const navegar = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(false);
  const contenedor = useRef(null);

  const cargar = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await api.get(`/notifications/user/${userId}`);
      setItems(Array.isArray(data) ? data : data?.content || []);
    } catch {
      /* silencioso: el panel nunca debe romper el dashboard */
    }
  }, [userId]);

  // Se consulta al abrir el panel, no al montar: antes se pedía siempre y
  // quedaban 2 peticiones por ciclo de render del dashboard.
  useEffect(() => {
    if (abierto && !cargando) {
      setCargando(true);
      void cargar().finally(() => setCargando(false));
    }
  }, [abierto, cargar, cargando]);

  // Cierra al pulsar Escape o hacer clic fuera.
  useEffect(() => {
    if (!abierto) return undefined;
    const porTecla = (e) => e.key === "Escape" && setAbierto(false);
    const porFuera = (e) => {
      if (contenedor.current && !contenedor.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener("keydown", porTecla);
    document.addEventListener("mousedown", porFuera);
    return () => {
      document.removeEventListener("keydown", porTecla);
      document.removeEventListener("mousedown", porFuera);
    };
  }, [abierto]);

  const marcarLeida = async (item) => {
    if (item.read) return;
    try {
      await api.patch(`/notifications/${item.id}/read`);
      await cargar();
    } catch {
      /* si falla, el estado local no cambia */
    }
  };

  const marcarTodas = async () => {
    const pendientes = items.filter((n) => !n.read);
    if (pendientes.length === 0) return;
    try {
      await Promise.all(
        pendientes.map((n) => api.patch(`/notifications/${n.id}/read`)),
      );
      await cargar();
    } catch {
      /* silencioso */
    }
  };

  const sinLeer = items.filter((n) => !n.read).length;
  const visibles = items.slice(0, limite);

  return (
    <div ref={contenedor} style={{ position: "relative" }}>
      <button
        type="button"
        className="notif-bell"
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-label={`Notificaciones${sinLeer > 0 ? ` (${sinLeer} sin leer)` : ""}`}
        title="Notificaciones"
      >
        <Icon name="bell" size={17} />
        {sinLeer > 0 && (
          <span className="notif-bell__badge">
            {sinLeer > 99 ? "99+" : sinLeer}
          </span>
        )}
      </button>

      {abierto && (
        <div className="notif-pop" role="dialog" aria-label="Notificaciones">
          <div className="notif-pop__head">
            <strong>Notificaciones</strong>
            <button
              type="button"
              onClick={marcarTodas}
              disabled={sinLeer === 0}
            >
              Marcar leídas
            </button>
          </div>

          {visibles.length === 0 ? (
            <p className="notif-pop__empty">
              {cargando
                ? "Cargando notificaciones..."
                : "No tienes notificaciones todavía."}
            </p>
          ) : (
            <div className="notif-pop__list">
              {visibles.map((n) => (
                <button
                  type="button"
                  key={n.id}
                  className={`notif-item${n.read ? "" : " notif-item--unread"}`}
                  onClick={() => void marcarLeida(n)}
                >
                  <span className="notif-item__icon">
                    <Icon
                      name={TIPO_NOTIFICACION[n.type]?.icon || "bell"}
                      size={15}
                    />
                  </span>
                  <span className="notif-item__body">
                    <strong>
                      {TIPO_NOTIFICACION[n.type]?.label || "Sistema"}
                    </strong>
                    <p>{n.content}</p>
                    <span className="notif-item__time">
                      {tiempoRelativo(n.createdAt)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="notif-pop__foot">
            <a
              href={rutaVerTodas}
              onClick={(e) => {
                e.preventDefault();
                setAbierto(false);
                navegar(rutaVerTodas);
              }}
            >
              Ver todas las notificaciones
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
