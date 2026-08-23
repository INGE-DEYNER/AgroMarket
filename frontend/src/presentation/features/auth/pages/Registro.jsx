import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api, { API_BASE } from "@/infrastructure/http/api";
import bgCampo from "@/assets/register-bg-campo.png";
import leafIcon from "@/assets/icon-leaf.svg";
import mapPinIcon from "@/assets/icon-map-pin.svg";
import shieldCheckIcon from "@/assets/icon-shield-check.svg";
import handHeartIcon from "@/assets/icon-hand-heart.svg";
import { ThemeToggle } from "@/presentation/shared/components/ThemeToggle";
import "@/presentation/styles/login.css";
import "@/presentation/styles/auth-flow.css";

const COUNTRY_CODES = [
  { code: "+57", name: "Colombia (🇨🇴)" },
  { code: "+1", name: "USA (🇺🇸)" },
  { code: "+34", name: "España (🇪🇸)" },
  { code: "+52", name: "México (🇲🇽)" },
  { code: "+54", name: "Argentina (🇦🇷)" },
  { code: "+56", name: "Chile (🇨🇱)" },
  { code: "+51", name: "Perú (🇵🇪)" },
  { code: "+58", name: "Venezuela (🇻🇪)" },
];

export default function Registro() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [rol, setRol] = useState("comprador"); // comprador | comprador_empresa | productor
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [codigoPais, setCodigoPais] = useState("+57");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [nit, setNit] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (success) {
      const params = new URLSearchParams(location.search);
      const redirect = params.get("redirect");
      const accion = params.get("accion");

      if (redirect) {
        const productoPendiente = localStorage.getItem("producto_pendiente");
        if (productoPendiente && accion === "comprar") {
          navigate(redirect + "?accion=comprar");
        } else {
          navigate(redirect);
        }
      }
    }
  }, [success, location.search, navigate]);

  const validateField = useCallback(
    (field, val) => {
      setErrors((prevErrors) => {
        const errs = { ...prevErrors };
        const strongPasswordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;

        switch (field) {
          case "nombre":
            if (!val.trim())
              errs.nombre = t("errors.required", "Campo requerido.");
            else delete errs.nombre;
            break;
          case "apellido":
            if (!val.trim())
              errs.apellido = t("errors.required", "Campo requerido.");
            else delete errs.apellido;
            break;
          case "email":
            if (!val || !/\S+@\S+\.\S+/.test(val))
              errs.email = t(
                "errors.invalidEmail",
                "Ingresa un correo válido.",
              );
            else delete errs.email;
            break;
          case "telefono":
            if (!val.trim())
              errs.telefono = t("errors.required", "Campo requerido.");
            else if (!/^\d{7,15}$/.test(val.trim()))
              errs.telefono = "Teléfono debe contener entre 7 y 15 dígitos.";
            else delete errs.telefono;
            break;
          case "password":
            if (!val) errs.password = t("errors.required", "Campo requerido.");
            else if (val.length < 8)
              errs.password = "La contraseña debe tener al menos 8 caracteres.";
            else if (!strongPasswordRegex.test(val))
              errs.password =
                "Debe contener al menos 1 mayúscula, 1 número y 1 carácter especial (ej: @$!%*?&.).";
            else delete errs.password;
            break;
          case "confirmPass":
            if (val !== password)
              errs.confirmPass = t(
                "errors.passwordMismatch",
                "Las contraseñas no coinciden.",
              );
            else delete errs.confirmPass;
            break;
          case "ubicacion":
            if (rol === "productor" && !val.trim())
              errs.ubicacion = "Campo requerido para productores.";
            else delete errs.ubicacion;
            break;
          case "nombreEmpresa":
            if (rol === "comprador_empresa" && !val.trim())
              errs.nombreEmpresa = "Nombre de empresa requerido.";
            else delete errs.nombreEmpresa;
            break;
          case "nit":
            if (rol === "comprador_empresa" && !val.trim())
              errs.nit = "NIT requerido.";
            else delete errs.nit;
            break;
          default:
            break;
        }

        return errs;
      });
    },
    [t, password, rol],
  );

  const handleFieldChange = (field, value, setter) => {
    setter(value);
    validateField(field, value);
  };

  const handleGoogleRegistro = () => {
    const rolSeleccionado = rol === "productor" ? "PRODUCER" : "BUYER";
    window.location.href = `${API_BASE.replace("/api", "")}/oauth2/authorization/google?role=${rolSeleccionado}`;
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "#e0e0e0", width: "0%" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[@$!%*?&.]/.test(pass)) score += 1;

    if (score <= 1)
      return { score: 1, label: "Débil", color: "#e53935", width: "33%" };
    if (score <= 3)
      return { score: 2, label: "Media", color: "#ff9800", width: "66%" };
    return { score: 3, label: "Fuerte", color: "#4caf50", width: "100%" };
  };

  const passwordStrength = getPasswordStrength(password);

  const validateAll = () => {
    const errs = {};
    if (!nombre.trim()) errs.nombre = t("errors.required", "Campo requerido.");
    if (!apellido.trim())
      errs.apellido = t("errors.required", "Campo requerido.");
    if (!email || !/\S+@\S+\.\S+/.test(email))
      errs.email = t("errors.invalidEmail", "Ingresa un correo válido.");
    if (!telefono.trim())
      errs.telefono = t("errors.required", "Campo requerido.");

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
    if (!password) {
      errs.password = t("errors.required", "Campo requerido.");
    } else if (password.length < 8) {
      errs.password = "La contraseña debe tener al menos 8 caracteres.";
    } else if (!strongPasswordRegex.test(password)) {
      errs.password =
        "Debe contener al menos 1 mayúscula, 1 número y 1 carácter especial (ej: @$!%*?&.).";
    }

    if (password !== confirmPass)
      errs.confirmPass = t(
        "errors.passwordMismatch",
        "Las contraseñas no coinciden.",
      );
    if (rol === "productor" && !ubicacion.trim())
      errs.ubicacion = "Campo requerido para productores.";
    if (rol === "comprador_empresa" && !nombreEmpresa.trim())
      errs.nombreEmpresa = "Nombre de empresa requerido.";
    if (rol === "comprador_empresa" && !nit.trim()) errs.nit = "NIT requerido.";
    if (!aceptaTerminos)
      errs.aceptaTerminos = "Debes aceptar los términos y la política.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateAll();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const payload = {
        firstName: nombre.trim(),
        lastName: apellido.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: `${codigoPais}${telefono.trim()}`,
        role: rol === "productor" ? "PRODUCER" : "BUYER",
        countryCode: codigoPais,
        location: rol === "productor" ? ubicacion.trim() : null,
        companyName: rol === "comprador_empresa" ? nombreEmpresa.trim() : null,
        nit: rol === "comprador_empresa" ? nit.trim() : null,
        isCompany: rol === "comprador_empresa",
      };

      await api.post("/auth/registro", payload);
      setSuccess(true);
    } catch (err) {
      if (err.campos) {
        const mappedErrors = {};
        const fieldMap = {
          firstName: "nombre",
          lastName: "apellido",
          phone: "telefono",
          countryCode: "codigoPais",
          location: "ubicacion",
          companyName: "nombreEmpresa",
          confirmPassword: "confirmPass",
        };

        Object.entries(err.campos).forEach(([field, msg]) => {
          const frontendField = fieldMap[field] || field;
          mappedErrors[frontendField] = msg;
        });
        setErrors(mappedErrors);
      } else {
        setErrors({ global: err.message || "Error al registrar." });
      }
    } finally {
      setLoading(false);
    }
  };

  const eyeIcon = (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const eyeOffIcon = (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <div className="login-page">
      {/* Selector de tema — reutiliza el mecanismo global del repo */}
      <div className="login-theme-toggle">
        <ThemeToggle />
      </div>

      {/* ── Panel izquierdo (frame: left-panel-split) ── */}
      <aside
        className="login-left"
        style={{ backgroundImage: `url(${bgCampo})` }}
      >
        <div className="login-left-overlay">
          <Link to="/home" className="login-brand">
            <span className="login-brand-icon">
              <img src={leafIcon} alt="" width="20" height="20" />
            </span>
            <span className="login-brand-name">
              <em>Agro</em>Market
            </span>
          </Link>

          <div className="login-banner">
            <span className="login-banner-badge">
              🇨🇴 {t("auth.bannerBadge", "Directo del campo colombiano")}
            </span>
            <h1 className="login-banner-title">
              {t("auth.registerHeroTitle", "Únete al movimiento del campo")}
            </h1>
            <p className="login-banner-sub">
              {t(
                "auth.registerHeroSub",
                "Productos 100% frescos de origen local, apoyo directo a familias productoras y compras garantizadas sin intermediarios dañinos.",
              )}
            </p>
          </div>

          <p className="login-left-note">
            <img src={mapPinIcon} alt="" width="18" height="18" />
            {t(
              "auth.leftNote",
              "Fincas de Urabá y de toda Colombia unidas en un solo lugar.",
            )}
          </p>
        </div>
      </aside>

      {/* ── Panel derecho: formulario (frame: form-container) ── */}
      <main className="login-right">
        <section className="login-form-container">
          {success ? (
            <>
              <header className="login-form-header">
                <h2>{t("auth.successTitle", "¡Cuenta creada!")}</h2>
                <p>
                  {t(
                    "auth.successSub",
                    "Verifica tu correo para activar tu cuenta y comenzar a disfrutar de AgroMarket.",
                  )}
                </p>
              </header>

              <div className="af-info-box af-success-summary">
                <p>
                  <strong>{t("auth.nameLabel", "Nombre")}:</strong> {nombre}{" "}
                  {apellido}
                </p>
                <p>
                  <strong>{t("auth.email", "Correo")}:</strong>{" "}
                  {email.replace(/(.{2})(.*)(@.*)/, "$1***$3")}
                </p>
                <p>
                  <strong>{t("auth.roleLabel", "Perfil")}:</strong>{" "}
                  {rol === "comprador_empresa"
                    ? t("auth.roleCompany", "Empresa")
                    : rol === "productor"
                      ? t("auth.producer", "Productor")
                      : t("auth.buyer", "Comprador")}
                </p>
              </div>

              <button
                type="button"
                className="af-btn-primary"
                onClick={() =>
                  navigate("/verificar-correo", { state: { email } })
                }
              >
                {t("auth.goVerify", "Ir a verificar correo")}
              </button>
            </>
          ) : (
            <>
              <header className="login-form-header">
                <h2>{t("auth.createAccount", "Crear cuenta")}</h2>
                <p>
                  {t(
                    "auth.registerFormSub",
                    "Únete a AgroMarket y apoya con orgullo a nuestros campesinos.",
                  )}
                </p>
              </header>

              {errors.global && (
                <div className="af-error" role="alert">
                  {errors.global}
                </div>
              )}

              <form className="af-form" noValidate onSubmit={handleSubmit}>
                {/* Selector de rol (funcionalidad real del repo) */}
                <div className="af-role-tabs" role="tablist">
                  {[
                    ["comprador", t("auth.buyer", "Comprador")],
                    ["comprador_empresa", t("auth.company", "Empresa")],
                    ["productor", t("auth.producer", "Productor")],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      role="tab"
                      aria-selected={rol === value}
                      className={`af-role-tab${rol === value ? " active" : ""}`}
                      onClick={() => setRol(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="af-form-grid">
                  <div className="af-field">
                    <label htmlFor="nombre">
                      {t("auth.firstName", "Nombre")}
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      className={`af-input${errors.nombre ? " has-error" : ""}`}
                      placeholder={t("auth.firstNamePlaceholder", "Ej. Juan")}
                      value={nombre}
                      onChange={(e) =>
                        handleFieldChange("nombre", e.target.value, setNombre)
                      }
                    />
                    {errors.nombre && (
                      <span className="af-error-text">{errors.nombre}</span>
                    )}
                  </div>
                  <div className="af-field">
                    <label htmlFor="apellido">
                      {t("auth.lastName", "Apellido")}
                    </label>
                    <input
                      id="apellido"
                      type="text"
                      className={`af-input${errors.apellido ? " has-error" : ""}`}
                      placeholder={t("auth.lastNamePlaceholder", "Pérez")}
                      value={apellido}
                      onChange={(e) =>
                        handleFieldChange(
                          "apellido",
                          e.target.value,
                          setApellido,
                        )
                      }
                    />
                    {errors.apellido && (
                      <span className="af-error-text">{errors.apellido}</span>
                    )}
                  </div>
                </div>

                <div className="af-field">
                  <label htmlFor="email">
                    {t("auth.email", "Correo electrónico")}
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`af-input${errors.email ? " has-error" : ""}`}
                    placeholder={t(
                      "forgotPass.emailPlaceholder",
                      "ejemplo@email.com",
                    )}
                    value={email}
                    onChange={(e) =>
                      handleFieldChange("email", e.target.value, setEmail)
                    }
                  />
                  {errors.email && (
                    <span className="af-error-text">{errors.email}</span>
                  )}
                </div>

                <div className="af-field">
                  <label htmlFor="telefono">
                    {t("auth.phone", "Teléfono")}
                  </label>
                  <div className="af-phone-row">
                    <select
                      aria-label={t("auth.countryCode", "Código de país")}
                      className="af-input af-select af-select--code"
                      value={codigoPais}
                      onChange={(e) => setCodigoPais(e.target.value)}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </select>
                    <input
                      id="telefono"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      className={`af-input${errors.telefono ? " has-error" : ""}`}
                      placeholder="3001234567"
                      value={telefono}
                      onChange={(e) =>
                        handleFieldChange(
                          "telefono",
                          e.target.value,
                          setTelefono,
                        )
                      }
                    />
                  </div>
                  {errors.telefono && (
                    <span className="af-error-text">{errors.telefono}</span>
                  )}
                </div>

                {rol === "productor" && (
                  <div className="af-field">
                    <label htmlFor="ubicacion">
                      {t("auth.location", "Ubicación / Vereda")}
                    </label>
                    <input
                      id="ubicacion"
                      type="text"
                      className={`af-input${errors.ubicacion ? " has-error" : ""}`}
                      placeholder={t(
                        "auth.locationPlaceholder",
                        "Ej. Vereda Las Margaritas, Chigorodó",
                      )}
                      value={ubicacion}
                      onChange={(e) =>
                        handleFieldChange(
                          "ubicacion",
                          e.target.value,
                          setUbicacion,
                        )
                      }
                    />
                    {errors.ubicacion && (
                      <span className="af-error-text">{errors.ubicacion}</span>
                    )}
                  </div>
                )}

                {rol === "comprador_empresa" && (
                  <div className="af-form-grid">
                    <div className="af-field">
                      <label htmlFor="nombreEmpresa">
                        {t("auth.companyName", "Nombre de la empresa")}
                      </label>
                      <input
                        id="nombreEmpresa"
                        type="text"
                        className={`af-input${errors.nombreEmpresa ? " has-error" : ""}`}
                        placeholder={t(
                          "auth.companyPlaceholder",
                          "Empresa S.A.S.",
                        )}
                        value={nombreEmpresa}
                        onChange={(e) =>
                          handleFieldChange(
                            "nombreEmpresa",
                            e.target.value,
                            setNombreEmpresa,
                          )
                        }
                      />
                      {errors.nombreEmpresa && (
                        <span className="af-error-text">
                          {errors.nombreEmpresa}
                        </span>
                      )}
                    </div>
                    <div className="af-field">
                      <label htmlFor="nit">NIT</label>
                      <input
                        id="nit"
                        type="text"
                        className={`af-input${errors.nit ? " has-error" : ""}`}
                        placeholder="900.123.456-7"
                        value={nit}
                        onChange={(e) =>
                          handleFieldChange("nit", e.target.value, setNit)
                        }
                      />
                      {errors.nit && (
                        <span className="af-error-text">{errors.nit}</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="af-form-grid">
                  <div className="af-field">
                    <label htmlFor="password">
                      {t("auth.password", "Contraseña")}
                    </label>
                    <div className="af-input-wrap">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className={`af-input${errors.password ? " has-error" : ""}`}
                        placeholder={t(
                          "resetPass.newPasswordPlaceholder",
                          "Mínimo 8 caracteres",
                        )}
                        value={password}
                        onChange={(e) =>
                          handleFieldChange(
                            "password",
                            e.target.value,
                            setPassword,
                          )
                        }
                      />
                      <button
                        type="button"
                        className="af-toggle-visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        {showPassword ? eyeOffIcon : eyeIcon}
                      </button>
                    </div>
                    {password && (
                      <div className="af-strength">
                        <div className="af-strength-track">
                          <div
                            className="af-strength-bar"
                            style={{
                              width: passwordStrength.width,
                              background: passwordStrength.color,
                            }}
                          />
                        </div>
                        <span style={{ color: passwordStrength.color }}>
                          {t("auth.strength", "Fortaleza")}:{" "}
                          {passwordStrength.label}
                        </span>
                      </div>
                    )}
                    {errors.password && (
                      <span className="af-error-text">{errors.password}</span>
                    )}
                  </div>

                  <div className="af-field">
                    <label htmlFor="confirmPass">
                      {t("auth.confirmPassword", "Confirmar contraseña")}
                    </label>
                    <div className="af-input-wrap">
                      <input
                        id="confirmPass"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className={`af-input${errors.confirmPass ? " has-error" : ""}`}
                        placeholder={t(
                          "resetPass.confirmPlaceholder",
                          "Repite tu contraseña",
                        )}
                        value={confirmPass}
                        onChange={(e) =>
                          handleFieldChange(
                            "confirmPass",
                            e.target.value,
                            setConfirmPass,
                          )
                        }
                      />
                      <button
                        type="button"
                        className="af-toggle-visibility"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        {showConfirmPassword ? eyeOffIcon : eyeIcon}
                      </button>
                    </div>
                    {errors.confirmPass && (
                      <span className="af-error-text">
                        {errors.confirmPass}
                      </span>
                    )}
                  </div>
                </div>

                {/* Términos (frame: terms-row) */}
                <label className="af-terms-row">
                  <input
                    type="checkbox"
                    checked={aceptaTerminos}
                    onChange={(e) => setAceptaTerminos(e.target.checked)}
                  />
                  <span className="af-checkbox-box" aria-hidden="true" />
                  <span className="af-terms-text">
                    {t("auth.acceptPrefix", "Acepto los")}{" "}
                    <Link to="/terminos-y-condiciones" target="_blank">
                      {t("auth.terms", "Términos y condiciones")}
                    </Link>{" "}
                    {t("auth.andThe", "y la")}{" "}
                    <Link to="/politica-privacidad" target="_blank">
                      {t("auth.privacy", "Política de privacidad")}
                    </Link>{" "}
                    {t("auth.ofAgromarket", "de AgroMarket.")}
                  </span>
                </label>
                {errors.aceptaTerminos && (
                  <span className="af-error-text">{errors.aceptaTerminos}</span>
                )}

                <button
                  type="submit"
                  className="af-btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? t("auth.creating", "Creando cuenta...")
                    : t("auth.registerCta", "Registrarme en AgroMarket")}
                </button>

                <div className="login-social-block">
                  <div className="login-divider">
                    <span>{t("auth.orRegisterWith", "o regístrate con")}</span>
                  </div>
                  <div className="login-social-row">
                    <button
                      type="button"
                      onClick={handleGoogleRegistro}
                      className="login-btn-social"
                    >
                      <svg width="20" height="20" viewBox="0 0 48 48">
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.73 17.74 9.5 24 9.5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.9c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        />
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        />
                        <path fill="none" d="M0 0h48v48H0z" />
                      </svg>
                      {t("auth.google", "Google")}
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}

          {/* Elementos inferiores (frame: bottom-elements) */}
          {!success && (
            <footer className="login-bottom">
              <div className="login-trust-badges">
                <span className="login-trust-badge">
                  <img src={shieldCheckIcon} alt="" width="16" height="16" />
                  {t("auth.trustSecure", "Compra 100% Segura")}
                </span>
                <span className="login-trust-badge">
                  <img src={handHeartIcon} alt="" width="16" height="16" />
                  {t("auth.trustLocal", "Apoyo campestre directo")}
                </span>
              </div>
              <p className="login-register-link">
                {t("auth.haveAccount", "¿Ya tienes una cuenta?")}{" "}
                <Link to="/login">{t("auth.signIn", "Inicia sesión")}</Link>
              </p>
            </footer>
          )}
        </section>
      </main>
    </div>
  );
}
