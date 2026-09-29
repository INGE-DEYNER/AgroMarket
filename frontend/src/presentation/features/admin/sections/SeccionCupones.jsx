/*
 * SeccionCupones — panel de administración.
 *
 * Movimiento puro del JSX que estaba dentro de Admin.jsx. Lo único que
 * cambia: el estado llega por contexto en vez de por el ámbito del padre, y
 * el contenedor ya no lleva la condición de activeSection porque con el
 * Outlet solo se monta la sección activa.
 */
import { useAdminData } from "./AdminContexto.js";
import { useAuth } from "@/app/hooks/useAuth";

export default function SeccionCupones() {
  const { formatPrice } = useAuth();
  const { handleCrearCupon, handleEliminarCupon, nuevoCupon, setNuevoCupon, todosCupones } = useAdminData();

  return (
<div className="section" id="sec-cupones">
                <div className="table-header">
                  <h3 className="card-title">
                    Gestión de Cupones de Descuento
                  </h3>
                </div>

                <form
                  onSubmit={handleCrearCupon}
                  style={{
                    background: "#f8fafc",
                    padding: "20px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    marginBottom: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      color: "var(--primary-dark)",
                      fontSize: "0.95rem",
                      fontWeight: "bold",
                    }}
                  >
                    Crear Nuevo Cupón
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                    className="form-row"
                  >
                    <div className="form-group">
                      <label
                        className="form-label"
                        style={{ fontSize: "0.85rem" }}
                      >
                        Código *
                      </label>
                      <input
                        className="form-input"
                        style={{
                          width: "100%",
                          padding: "6px 10px",
                          fontSize: "0.85rem",
                        }}
                        placeholder="DESCUENTO10"
                        value={nuevoCupon.codigo}
                        onChange={(e) =>
                          setNuevoCupon({
                            ...nuevoCupon,
                            codigo: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label
                        className="form-label"
                        style={{ fontSize: "0.85rem" }}
                      >
                        Tipo *
                      </label>
                      <select
                        className="form-input"
                        style={{
                          width: "100%",
                          padding: "6px 10px",
                          fontSize: "0.85rem",
                        }}
                        value={nuevoCupon.tipo}
                        onChange={(e) =>
                          setNuevoCupon({
                            ...nuevoCupon,
                            tipo: e.target.value,
                          })
                        }
                      >
                        <option value="ENVIO_GRATIS">Envío Gratis</option>
                        <option value="PORCENTAJE">
                          Porcentaje de Descuento
                        </option>
                        <option value="MONTO_FIJO">Monto Fijo</option>
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                    className="form-row"
                  >
                    <div className="form-group">
                      <label
                        className="form-label"
                        style={{ fontSize: "0.85rem" }}
                      >
                        Valor Descuento / Porcentaje
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        style={{
                          width: "100%",
                          padding: "6px 10px",
                          fontSize: "0.85rem",
                        }}
                        value={nuevoCupon.valor}
                        onChange={(e) =>
                          setNuevoCupon({
                            ...nuevoCupon,
                            valor: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label
                        className="form-label"
                        style={{ fontSize: "0.85rem" }}
                      >
                        Monto Mínimo Compra
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        style={{
                          width: "100%",
                          padding: "6px 10px",
                          fontSize: "0.85rem",
                        }}
                        value={nuevoCupon.montoMinimo}
                        onChange={(e) =>
                          setNuevoCupon({
                            ...nuevoCupon,
                            montoMinimo: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                    className="form-row"
                  >
                    <div className="form-group">
                      <label
                        className="form-label"
                        style={{ fontSize: "0.85rem" }}
                      >
                        ID Usuario (Opcional, vacío para global)
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        style={{
                          width: "100%",
                          padding: "6px 10px",
                          fontSize: "0.85rem",
                        }}
                        placeholder="Opcional"
                        value={nuevoCupon.usuarioId}
                        onChange={(e) =>
                          setNuevoCupon({
                            ...nuevoCupon,
                            usuarioId: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label
                        className="form-label"
                        style={{ fontSize: "0.85rem" }}
                      >
                        Fecha Expiración (Opcional)
                      </label>
                      <input
                        type="date"
                        className="form-input"
                        style={{
                          width: "100%",
                          padding: "6px 10px",
                          fontSize: "0.85rem",
                        }}
                        value={nuevoCupon.fechaExpiracion}
                        onChange={(e) =>
                          setNuevoCupon({
                            ...nuevoCupon,
                            fechaExpiracion: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    type="submit"
                    style={{ alignSelf: "flex-start", marginTop: "6px" }}
                  >
                    Crear Cupón
                  </button>
                </form>

                <div className="table-wrap">
                  <table className="table-responsive">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                        <th>Monto Min.</th>
                        <th>Usuario ID</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todosCupones.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            style={{
                              textAlign: "center",
                              padding: "16px",
                              color: "var(--text-muted)",
                            }}
                          >
                            No hay cupones registrados.
                          </td>
                        </tr>
                      ) : (
                        todosCupones.map((c) => (
                          <tr key={c.id}>
                            <td
                              data-label="Código"
                              style={{ fontWeight: "bold" }}
                            >
                              {c.codigo}
                            </td>
                            <td data-label="Tipo">{c.tipo}</td>
                            <td data-label="Valor">
                              {c.tipo === "PORCENTAJE"
                                ? `${c.valor}%`
                                : formatPrice(c.valor)}
                            </td>
                            <td data-label="Monto Min.">
                              {formatPrice(c.montoMinimo || 0)}
                            </td>
                            <td data-label="Usuario ID">
                              {c.usuarioId || "Global"}
                            </td>
                            <td data-label="Acciones">
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleEliminarCupon(c.id)}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
  );
}
