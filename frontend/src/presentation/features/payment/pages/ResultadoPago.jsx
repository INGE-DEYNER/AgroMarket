import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "@/infrastructure/http/api";
import Icon from "@/presentation/shared/components/Icon";
import PublicLayout from "@/presentation/shared/components/PublicLayout";
import "@/presentation/styles/public-views.css";

/**
 * Pantalla de resultado del pago.
 *
 * UNA sola pagina para los tres desenlaces, distinguidos por `estado`:
 *   /pago/exitoso    -> pago confirmado
 *   /pago/fallido    -> rechazado o cancelado
 *   /pago/pendiente  -> a la espera de confirmacion de la pasarela
 *
 * POR QUE EXISTE: el backend (MercadoPagoPaymentGatewayAdapter) devuelve
 * `checkoutUrl` = FRONTEND_URL + "/pago/exitoso?pagoId=N", y sus backUrls
 * apuntan a /pago/exitoso, /pago/fallido y /pago/pendiente. Ninguna de las
 * tres rutas existia en el router, asi que tras pagar el usuario caia en un
 * 404 sin explicacion, con el pedido ya creado y el pago registrado.
 *
 * Acepta los dos formatos de query que usan los distintos puntos de entrada:
 *   ?pagoId=N        -> el que devuelve el backend al iniciar el pago
 *   ?reference=...   -> el que usa SeleccionMetodoPago tras confirmar
 *   ?orderId=N       -> idem, por si la pasarela lo manda
 */

const ESTADOS = {
  exitoso: {
    icono: "check",
    color: "#16a34a",
    fondo: "rgba(22, 163, 74, 0.12)",
    titulo: "Pago confirmado",
    texto:
      "Tu pago fue recibido. El productor ya fue notificado y empieza a preparar tu pedido.",
  },
  fallido: {
    icono: "alert",
    color: "#dc2626",
    fondo: "rgba(220, 38, 38, 0.12)",
    titulo: "No pudimos confirmar el pago",
    texto:
      "La pasarela no aprobo la transaccion. No se realizo ningun cargo: puedes intentar de nuevo.",
  },
  pendiente: {
    icono: "clock",
    color: "#b45309",
    fondo: "rgba(180, 83, 9, 0.12)",
    titulo: "Pago en proceso",
    texto:
      "Tu pago fue enviado a la pasarela y estamos esperando su confirmacion. Te avisaremos en cuanto responda.",
  },
};

const FILA = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
};

export default function ResultadoPago({ estado }) {
  const [params] = useSearchParams();
  const [pago, setPago] = useState(null);
  const [consulta, setConsulta] = useState("pendiente");

  const pagoId = params.get("pagoId");
  const orderId = params.get("orderId");
  const referencia = params.get("reference");

  const conf = ESTADOS[estado] || ESTADOS.pendiente;

  /*
   * Consulta el pago para mostrar el monto real. Es informativo: si falla, la
   * pagina sigue mostrando el desenlace, porque el estado ya lo decide la URL
   * y no debe quedar en blanco por un fallo de red.
   */
  useEffect(() => {
    let vigente = true;
    if (!pagoId) {
      setConsulta("sin-id");
      return undefined;
    }
    api
      .get(`/pagos/${pagoId}`)
      .then((r) => {
        if (!vigente) return;
        setPago(r?.data || r);
        setConsulta("ok");
      })
      .catch(() => {
        if (vigente) setConsulta("error");
      });
    return () => {
      vigente = false;
    };
  }, [pagoId]);

  const monto = pago?.amount ?? pago?.monto ?? null;

  return (
    <PublicLayout>
      <div
        className="am-page"
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            width: "100%",
            background: "var(--surface, #fff)",
            border: "1px solid var(--border, #e2e8f0)",
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: "68px",
              height: "68px",
              margin: "0 auto 18px",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: conf.fondo,
              color: conf.color,
            }}
          >
            <Icon name={conf.icono} size={34} />
          </div>

          <h1 style={{ fontSize: "1.4rem", margin: "0 0 10px", color: "#1b4332" }}>
            {conf.titulo}
          </h1>
          <p style={{ color: "#4a5568", lineHeight: 1.55, margin: "0 0 20px" }}>
            {conf.texto}
          </p>

          <dl
            style={{
              textAlign: "left",
              margin: "0 0 22px",
              padding: "16px",
              borderRadius: "12px",
              background: "var(--surface2, #f8faf8)",
              fontSize: "0.9rem",
              display: "grid",
              gap: "10px",
            }}
          >
            {pagoId && (
              <div style={FILA}>
                <dt style={{ color: "#64748b" }}>Pago</dt>
                <dd style={{ margin: 0, fontWeight: 600 }}>#{pagoId}</dd>
              </div>
            )}
            {orderId && (
              <div style={FILA}>
                <dt style={{ color: "#64748b" }}>Pedido</dt>
                <dd style={{ margin: 0, fontWeight: 600 }}>#{orderId}</dd>
              </div>
            )}
            {referencia && (
              <div style={FILA}>
                <dt style={{ color: "#64748b" }}>Referencia</dt>
                <dd
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    fontFamily: "monospace",
                    fontSize: "0.82rem",
                    wordBreak: "break-all",
                    textAlign: "right",
                  }}
                >
                  {referencia}
                </dd>
              </div>
            )}
            {monto !== null && (
              <div style={FILA}>
                <dt style={{ color: "#64748b" }}>Monto</dt>
                <dd style={{ margin: 0, fontWeight: 600 }}>
                  ${Number(monto).toLocaleString("es-CO")}
                </dd>
              </div>
            )}
            {pago?.state && (
              <div style={FILA}>
                <dt style={{ color: "#64748b" }}>Estado</dt>
                <dd style={{ margin: 0, fontWeight: 600 }}>{pago.state}</dd>
              </div>
            )}
          </dl>

          {consulta === "error" && (
            <p
              role="status"
              style={{
                fontSize: "0.82rem",
                color: "#92400e",
                background: "rgba(180, 83, 9, 0.1)",
                border: "1px solid rgba(180, 83, 9, 0.3)",
                borderRadius: "8px",
                padding: "10px 12px",
                marginBottom: "18px",
              }}
            >
              No pudimos consultar el detalle del pago, pero el resultado de tu
              operacion es el que se muestra arriba.
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/dashboard-comprador/misPedidos"
              className="btn btn-primary"
              style={{ textDecoration: "none" }}
            >
              Ver mis pedidos
            </Link>
            <Link
              to="/catalogo"
              className="btn btn-secondary"
              style={{ textDecoration: "none" }}
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

