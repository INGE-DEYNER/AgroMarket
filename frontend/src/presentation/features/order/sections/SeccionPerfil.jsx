/*
 * SeccionPerfil — sección del panel.
 *
 * Movimiento puro del JSX que estaba dentro del archivo del panel. Lo
 * único que cambia: el estado llega por contexto en vez de por el ámbito del
 * padre, y el contenedor ya no lleva la condición de activeSection porque
 * con el Outlet solo se monta la sección activa.
 */
import { useCompradorData } from "./CompradorContexto.js";
import { useAuth } from "@/app/hooks/useAuth";
import Icon from "@/presentation/shared/components/Icon";

export default function SeccionPerfil() {
  const { user } = useAuth();
  const { handleUpdatePassword, handleUpdatePerfil, perfilForm, perfilMsg, pwForm, pwMsg, setPerfilForm, setPwForm, setShowCurrentPassword, setShowNewPassword, showCurrentPassword, showNewPassword } = useCompradorData();

  return (
<div className="section" id="sec-perfil">
          <div className="dash-header">
            <div className="dash-welcome">
              <h1> Ajustes de Mi Perfil</h1>
              <p>
                Administra tu información personal y la seguridad de tu cuenta
              </p>
            </div>
          </div>

          <div className="perfil-grid">
            {/* Profile Details Form */}
            <div className="card-table perfil-card">
              <h3 className="perfil-card__title">Datos Personales</h3>
              {perfilMsg.text && (
                <div className={`perfil-alert perfil-alert--${perfilMsg.type}`}>
                  {perfilMsg.text}
                </div>
              )}
              <form onSubmit={handleUpdatePerfil}>
                <div className="form-group">
                  <label className="form-label" htmlFor="comprador-nombre">
                    Nombre Completo
                  </label>
                  <input
                    id="comprador-nombre"
                    className="form-input"
                    value={perfilForm.nombre}
                    onChange={(e) =>
                      setPerfilForm({ ...perfilForm, nombre: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="comprador-telefono">
                    Teléfono Móvil
                  </label>
                  <input
                    id="comprador-telefono"
                    className="form-input"
                    type="tel"
                    inputMode="numeric"
                    value={perfilForm.telefono}
                    onChange={(e) =>
                      setPerfilForm({
                        ...perfilForm,
                        telefono: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="comprador-email">
                    Correo Electrónico (No editable)
                  </label>
                  <input
                    id="comprador-email"
                    className="form-input is-readonly"
                    value={user?.email || ""}
                    readOnly
                  />
                </div>
                <button
                  className="btn btn-primary perfil-submit"
                  type="submit"
                >
                  Guardar Cambios
                </button>
              </form>
            </div>

            {/* Password Change Form */}
            <div className="card-table perfil-card">
              <h3 className="perfil-card__title">Seguridad de la Cuenta</h3>
              {pwMsg.text && (
                <div className={`perfil-alert perfil-alert--${pwMsg.type}`}>
                  {pwMsg.text}
                </div>
              )}
              <form onSubmit={handleUpdatePassword}>
                <div className="form-group">
                  <label className="form-label" htmlFor="comprador-pw-actual">
                    Contraseña Actual
                  </label>
                  <div className="perfil-secret">
                    <input
                      id="comprador-pw-actual"
                      className="form-input"
                      type={showCurrentPassword ? "text" : "password"}
                      value={pwForm.contrasenaActual}
                      onChange={(e) =>
                        setPwForm({
                          ...pwForm,
                          contrasenaActual: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      className="perfil-secret__toggle"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      aria-label={
                        showCurrentPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showCurrentPassword ? (
                        <Icon name="eyeOff" size={17} />
                      ) : (
                        <Icon name="eye" size={17} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="comprador-pw-nueva">
                    Nueva Contraseña
                  </label>
                  <div className="perfil-secret">
                    <input
                      id="comprador-pw-nueva"
                      className="form-input"
                      type={showNewPassword ? "text" : "password"}
                      value={pwForm.nuevaContrasena}
                      onChange={(e) =>
                        setPwForm({
                          ...pwForm,
                          nuevaContrasena: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      className="perfil-secret__toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={
                        showNewPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showNewPassword ? (
                        <Icon name="eyeOff" size={17} />
                      ) : (
                        <Icon name="eye" size={17} />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  className="btn btn-primary perfil-submit"
                  type="submit"
                >
                  Cambiar Contraseña
                </button>
              </form>
            </div>
          </div>
        </div>
  );
}
