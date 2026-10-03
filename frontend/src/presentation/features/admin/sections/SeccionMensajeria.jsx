/*
 * SeccionMensajeria — panel de administración.
 *
 * Movimiento puro del JSX que estaba dentro de Admin.jsx. Lo único que
 * cambia: el estado llega por contexto en vez de por el ámbito del padre, y
 * el contenedor ya no lleva la condición de activeSection porque con el
 * Outlet solo se monta la sección activa.
 */
import { useAdminData } from "./AdminContexto.js";

export default function SeccionMensajeria() {
  const { enviandoMensaje, handleEnviarMensaje, mensajeForm, mensajeMsg, mensajeUsuarios, searchMensajeInput, setMensajeForm, setSearchMensajeInput } = useAdminData();

  return (
<div className="section" id="sec-mensajeria">
                <div className="table-header">
                  <div>
                    <h3 className="card-title">Enviar Mensaje a Usuarios</h3>
                    <p className="section-subtitle">
                      Envía notificaciones y mensajes directos a cualquier
                      usuario.
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "24px",
                  }}
                >
                  {/* Columna izquierda - Formulario */}
                  <div
                    style={{
                      background: "#fff",
                      padding: "24px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 16px 0",
                        fontSize: "1rem",
                        fontWeight: "bold",
                      }}
                    >
                      Componer Mensaje
                    </h4>
                    <form onSubmit={handleEnviarMensaje}>
                      <div style={{ marginBottom: "16px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: "600",
                            fontSize: "0.85rem",
                          }}
                        >
                          Usuario Destinatario *
                        </label>
                        <select
                          value={mensajeForm.usuarioId}
                          onChange={(e) =>
                            setMensajeForm({
                              ...mensajeForm,
                              usuarioId: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #cfd9d1",
                            fontSize: "0.9rem",
                          }}
                        >
                          <option value="">-- Seleccionar usuario --</option>
                          {mensajeUsuarios.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.nombre} {u.apellido} ({u.email})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ marginBottom: "16px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: "600",
                            fontSize: "0.85rem",
                          }}
                        >
                          Tipo de Mensaje *
                        </label>
                        <select
                          value={mensajeForm.tipo}
                          onChange={(e) =>
                            setMensajeForm({
                              ...mensajeForm,
                              tipo: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #cfd9d1",
                            fontSize: "0.9rem",
                          }}
                        >
                          <option value="NEW_MESSAGE">Mensaje Directo</option>
                          <option value="NEW_ORDER">Nuevo Pedido</option>
                          <option value="ORDER_UPDATED">
                            Pedido Actualizado
                          </option>
                          <option value="PAYMENT_CONFIRMED">
                            Pago Confirmado
                          </option>
                          <option value="LOW_STOCK">Stock Bajo</option>
                        </select>
                      </div>
                      <div style={{ marginBottom: "16px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: "600",
                            fontSize: "0.85rem",
                          }}
                        >
                          Contenido del Mensaje *
                        </label>
                        <textarea
                          value={mensajeForm.contenido}
                          onChange={(e) =>
                            setMensajeForm({
                              ...mensajeForm,
                              contenido: e.target.value,
                            })
                          }
                          rows={5}
                          placeholder="Escribe aqui el mensaje que deseas enviar al usuario..."
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #cfd9d1",
                            fontSize: "0.9rem",
                            resize: "vertical",
                            minHeight: "120px",
                          }}
                        />
                      </div>
                      {mensajeMsg.text && (
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: "8px",
                            marginBottom: "16px",
                            background:
                              mensajeMsg.type === "success"
                                ? "#e8f5e9"
                                : "#fef2f2",
                            color:
                              mensajeMsg.type === "success"
                                ? "#11823b"
                                : "#dc2626",
                            fontSize: "0.85rem",
                            fontWeight: "500",
                          }}
                        >
                          {mensajeMsg.text}
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={enviandoMensaje}
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                      >
                        {enviandoMensaje ? "Enviando..." : "Enviar Mensaje"}
                      </button>
                    </form>
                  </div>
                  {/* Columna derecha - Lista de usuarios */}
                  <div
                    style={{
                      background: "#fff",
                      padding: "24px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 16px 0",
                        fontSize: "1rem",
                        fontWeight: "bold",
                      }}
                    >
                      Usuarios Disponibles
                    </h4>
                    <div style={{ marginBottom: "16px" }}>
                      <input
                        type="text"
                        placeholder="Buscar usuario..."
                        value={searchMensajeInput}
                        onChange={(e) =>
                          setSearchMensajeInput(e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid #cfd9d1",
                          fontSize: "0.85rem",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        maxHeight: "400px",
                        overflowY: "auto",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    >
                      {mensajeUsuarios.length === 0 ? (
                        <p
                          style={{
                            padding: "20px",
                            textAlign: "center",
                            color: "#64748b",
                            fontSize: "0.85rem",
                          }}
                        >
                          No hay usuarios disponibles.
                        </p>
                      ) : (
                        <table className="table-responsive">
                          <thead>
                            <tr>
                              <th>Usuario</th>
                              <th>Rol</th>
                              <th>Acción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mensajeUsuarios.map((u) => (
                              <tr key={u.id}>
                                <td data-label="Usuario">
                                  <strong>
                                    {u.nombre} {u.apellido}
                                  </strong>
                                  <br />
                                  <small style={{ color: "#64748b" }}>
                                    {u.email}
                                  </small>
                                </td>
                                <td data-label="Rol">
                                  <span className="badge-status">
                                    {(u.role || u.rol)?.toUpperCase() ||
                                      "USER"}
                                  </span>
                                </td>
                                <td data-label="Acción">
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() =>
                                      setMensajeForm({
                                        ...mensajeForm,
                                        usuarioId: u.id.toString(),
                                      })
                                    }
                                  >
                                    Seleccionar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
  );
}
