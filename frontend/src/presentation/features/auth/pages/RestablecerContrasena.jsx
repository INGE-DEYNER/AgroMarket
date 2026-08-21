import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/infrastructure/http/api";
import "@/presentation/styles/login.css";

export default function RestablecerContrasena() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const email = location.state?.email || "";

  const [step, setStep] = useState(1); // 1: verify code, 2: set new password
  const [codigo, setCodigo] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() => {
    if (!email) {
      return t(
        "resetPass.emailError",
        "No se ha proporcionado un correo electrónico. Por favor, solicita un nuevo código.",
      );
    }

    return "";
  });
  const [success, setSuccess] = useState("");

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!email) return;
    if (!codigo) {
      setError(
        t("resetPass.inputCodeError", "Ingresa el código de 6 dígitos."),
      );
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/verify-code", {
        correo: email,
        codigo,
      });
      // Backend returns { success, data: { tempToken } } — unwrap correctly
      const token =
        res?.data?.tempToken ||
        res?.tempToken ||
        (typeof res === "string" ? res : null);
      console.log("verifyCode response:", res, "| tempToken:", token);
      setTempToken(token);
      setStep(2);
      setSuccess(
        t(
          "resetPass.codeVerified",
          "Código verificado. Ahora ingresa tu nueva contraseña.",
        ),
      );
    } catch (err) {
      setError(
        err.message ||
          t("resetPass.codeVerifyError", "Código incorrecto o expirado."),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError(
        t(
          "errors.minPassword",
          "La contraseña debe tener al menos 6 caracteres.",
        ),
      );
      return;
    }
    if (password !== confirmPass) {
      setError(t("errors.passwordMismatch", "Las contraseñas no coinciden."));
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/restablecer-contrasena", {
        token: tempToken,
        nuevaContrasena: password,
      });
      setSuccess(
        t(
          "resetPass.resetSuccess",
          "Contraseña restablecida con éxito. Redirigiendo al inicio de sesión...",
        ),
      );
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(
        err.message ||
          t("resetPass.resetError", "Error al restablecer la contraseña."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="left-panel">
        <Link to="/home" className="brand">
          <div className="brand-logo">
            <img
              src="/logo-asafrut.jpg"
              alt="Asafrut Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "4px",
              }}
            />
          </div>
          <div>
            <div className="brand-name">AgroMarket</div>
            <div className="brand-sub">ASAFRUT · Chigorodó, Antioquia</div>
          </div>
        </Link>

        <div style={{ margin: "auto 0", maxWidth: "400px", width: "100%" }}>
          <h1 className="page-title">
            {t("resetPass.title", "Restablecer contraseña")}
          </h1>
          <p className="page-sub">
            {step === 1
              ? t(
                  "resetPass.subStep1",
                  "Ingresa el código que enviamos a tu correo.",
                )
              : t("resetPass.subStep2", "Crea tu nueva contraseña segura.")}
          </p>

          {error && (
            <div
              className="global-error"
              style={{ display: "block", marginBottom: "16px" }}
            >
              {error}
            </div>
          )}
          {success && step === 2 && !tempToken && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: "3rem" }}></div>
              <p style={{ marginTop: "16px" }}>{success}</p>
            </div>
          )}

          {!email && !success && (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <Link
                to="/recuperar-contrasena"
                className="btn-submit"
                style={{ display: "inline-block", textDecoration: "none" }}
              >
                {t("resetPass.requestNewCodeBtn", "Solicitar nuevo código")}
              </Link>
            </div>
          )}

          {email && step === 1 && (
            <form onSubmit={handleVerifyCode}>
              <div className="form-group">
                <label className="form-label">
                  {t("auth.email", "Correo electrónico")}
                </label>
                <input
                  className="form-input"
                  type="email"
                  value={email}
                  disabled
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="codigo">
                  {t("forgotPass.codeLabel", "Código de recuperación")}
                </label>
                <input
                  className="form-input"
                  type="text"
                  id="codigo"
                  placeholder={t("resetPass.codePlaceholder", "123456")}
                  maxLength={6}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  style={{
                    letterSpacing: "8px",
                    fontSize: "1.2rem",
                    textAlign: "center",
                  }}
                  disabled={loading}
                />
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading
                  ? t("verifyEmail.verifyingBtn", "Verificando...")
                  : t("resetPass.verifyBtn", "Verificar código")}
              </button>
            </form>
          )}

          {
            step === 2 && !(!tempToken && success) && (
              <form onSubmit={handleResetPassword}>
                {success && (
                  <div
                    style={{
                      color: "#27ae60",
                      marginBottom: "16px",
                      fontWeight: "500",
                    }}
                  >
                    {success}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label" htmlFor="password">
                    {t("resetPass.newPassword", "Nueva contraseña")}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="form-input"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      style={{ paddingRight: "40px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        // Eye-off SVG
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="#6b7280"
                        >
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                        </svg>
                      ) : (
                        // Eye SVG
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="#6b7280"
                        >
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPass">
                    {t("auth.confirmPassword", "Confirmar contraseña")}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="form-input"
                      type={showConfirmPass ? "text" : "password"}
                      id="confirmPass"
                      placeholder="••••••••"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      disabled={loading}
                      style={{ paddingRight: "40px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label={
                        showConfirmPass ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPass ? (
                        // Eye-off SVG
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="#6b7280"
                        >
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                        </svg>
                      ) : (
                        // Eye SVG
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="#6b7280"
                        >
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading
                    ? t("resetPass.savingBtn", "Guardando...")
                    : t("resetPass.saveBtn", "Guardar nueva contraseña")}
                </button>
              </form>
            ) /* end step 2 */
          }

          <div className="form-footer" style={{ marginTop: "24px" }}>
            <Link to="/login">
              {t("forgotPass.backToLogin", "← Volver al inicio de sesión")}
            </Link>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200"
          alt="Cultivos"
          className="bg-img"
          loading="lazy"
        />
        <div className="right-overlay">
          <div className="right-badge">
            {t("forgotPass.badge", "AgroMarket ASAFRUT")}
          </div>
          <h2 className="right-title">
            {t("resetPass.rightTitle", "Tu nueva contraseña es tu llave.")}
          </h2>
          <p className="right-sub">
            {t(
              "resetPass.rightSub",
              "Crea una contraseña segura para proteger tu cuenta.",
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
