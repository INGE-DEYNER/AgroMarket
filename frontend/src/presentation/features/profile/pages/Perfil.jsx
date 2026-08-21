import { useState, useEffect } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { Link } from "react-router-dom";
import { useSecureParams } from "@/presentation/shared/hooks/useSecureParams";
import api from "@/infrastructure/http/api";
import Navbar from "@/presentation/shared/components/Navbar";
import "@/presentation/styles/styles.css";

const DIVISAS = [
  { codigo: "COP", nombre: "Peso colombiano", bandera: "ðŸ‡¨ðŸ‡´" },
  { codigo: "USD", nombre: "DÃ³lar estadounidense", bandera: "ðŸ‡ºðŸ‡¸" },
  { codigo: "EUR", nombre: "Euro", bandera: "ðŸ‡ªðŸ‡º" },
  { codigo: "GBP", nombre: "Libra esterlina", bandera: "ðŸ‡¬ðŸ‡§" },
  { codigo: "BRL", nombre: "Real brasileÃ±o", bandera: "ðŸ‡§ðŸ‡·" },
  { codigo: "MXN", nombre: "Peso mexicano", bandera: "ðŸ‡²ðŸ‡½" },
  { codigo: "CLP", nombre: "Peso chileno", bandera: "ðŸ‡¨ðŸ‡±" },
  { codigo: "PEN", nombre: "Sol peruano", bandera: "ðŸ‡µðŸ‡ª" },
  { codigo: "ARS", nombre: "Peso argentino", bandera: "ðŸ‡¦ðŸ‡·" },
  { codigo: "CAD", nombre: "DÃ³lar canadiense", bandera: "ðŸ‡¨ðŸ‡¦" },
  { codigo: "JPY", nombre: "Yen japonÃ©s", bandera: "ðŸ‡¯ðŸ‡µ" },
  { codigo: "CNY", nombre: "Yuan chino", bandera: "ðŸ‡¨ðŸ‡³" },
];

export default function Perfil() {
  const { user, setUser, logout, refetchUser, setDivisaActual } = useAuth();
  const [params, setParams] = useSecureParams();

  const [activeTab, setActiveTab] = useState(params.tab || "personal");

  useEffect(() => {
    setParams({ tab: activeTab });
  }, [activeTab, setParams]);

  // Personal Info Form
  const [nombre, setNombre] = useState(user?.nombre || "");
  const [apellido, setApellido] = useState(user?.apellido || "");
  const [telefono, setTelefono] = useState(user?.telefono || "");
  const [codigoPais, setCodigoPais] = useState(user?.codigoPais || "+57");
  const [ubicacion, setUbicacion] = useState(user?.ubicacion || "");
  const [nombreEmpresa, setNombreEmpresa] = useState(user?.nombreEmpresa || "");
  const [nit, setNit] = useState(user?.nit || "");
  const [cuentaBancaria, setCuentaBancaria] = useState(
    user?.cuentaBancaria || "",
  );

  // Shipping Address Form
  const [departamento, setDepartamento] = useState(user?.departamento || "");
  const [ciudad, setCiudad] = useState(user?.ciudad || "");
  const [direccionCompleta, setDireccionCompleta] = useState(
    user?.direccionCompleta || "",
  );
  const [referencia, setReferencia] = useState(user?.referencia || "");
  const [codigoPostal, setCodigoPostal] = useState(user?.codigoPostal || "");

  // Security Form
  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarNueva, setConfirmarNueva] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNew, setShowConfirmNew] = useState(false);

  // Cards state
  const [tarjetas, setTarjetas] = useState([]);
  const [tarjetaModalOpen, setTarjetaModalOpen] = useState(false);
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [tipoDetectado, setTipoDetectado] = useState(null);
  const [tarjetaValida, setTarjetaValida] = useState(false);
  const [tarjetaPredeterminada, setTarjetaPredeterminada] = useState(false);

  // Coupons state
  const [cupones, setCupones] = useState([]);

  // Preference state
  const [divisaPreferida, setDivisaPreferida] = useState(
    user?.divisaPreferida || "COP",
  );

  // Messages
  const [personalMsg, setPersonalMsg] = useState({ type: "", text: "" });
  const [securityMsg, setSecurityMsg] = useState({ type: "", text: "" });
  const [cardMsg, setCardMsg] = useState({ type: "", text: "" });
  const [prefMsg, setPrefMsg] = useState({ type: "", text: "" });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || "");
      setApellido(user.apellido || "");

      // Parse phone prefix out for display
      let rawPhone = user.telefono || "";
      const prefix = user.codigoPais || "+57";
      if (rawPhone.startsWith(prefix)) {
        rawPhone = rawPhone.substring(prefix.length);
      }
      setTelefono(rawPhone);

      setCodigoPais(prefix);
      setUbicacion(user.ubicacion || "");
      setNombreEmpresa(user.nombreEmpresa || "");
      setNit(user.nit || "");
      setCuentaBancaria(user.cuentaBancaria || "");
      setDivisaPreferida(user.divisaPreferida || "COP");
      setDepartamento(user.departamento || "");
      setCiudad(user.ciudad || "");
      setDireccionCompleta(user.direccionCompleta || "");
      setReferencia(user.referencia || "");
      setCodigoPostal(user.codigoPostal || "");
    }
  }, [user]);

  // Load cards and coupons when settings tab changes
  useEffect(() => {
    if (activeTab === "tarjetas") {
      loadTarjetas();
    } else if (activeTab === "cupones") {
      loadCupones();
    }
  }, [activeTab]);

  async function loadTarjetas() {
    try {
      const res = await api.get("/tarjetas");
      setTarjetas(res.data || res || []);
    } catch (err) {
      console.error("Error loading cards:", err);
    }
  };

  async function loadCupones() {
    try {
      const res = await api.get("/cupones");
      setCupones(res.data || res || []);
    } catch (err) {
      console.error("Error loading coupons:", err);
    }
  };

  const handleUpdatePersonal = async (e) => {
    e.preventDefault();
    setPersonalMsg({ type: "", text: "" });
    if (!nombre.trim() || !apellido.trim() || !telefono.trim()) {
      setPersonalMsg({
        type: "error",
        text: "Nombre, Apellido y TelÃ©fono son obligatorios.",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: codigoPais + telefono.trim(),
        codigoPais,
        departamento: departamento.trim(),
        ciudad: ciudad.trim(),
        direccionCompleta: direccionCompleta.trim(),
        referencia: referencia.trim(),
        codigoPostal: codigoPostal.trim(),
        ubicacion: user?.role === "productor" ? ubicacion.trim() : undefined,
        nombreEmpresa:
          user?.esEmpresa || user?.role === "comprador_empresa"
            ? nombreEmpresa.trim()
            : undefined,
        nit:
          user?.esEmpresa || user?.role === "comprador_empresa"
            ? nit.trim()
            : undefined,
        cuentaBancaria:
          user?.role === "productor" ? cuentaBancaria.trim() : undefined,
      };

      const res = await api.put("/usuarios/mi-perfil", payload);
      const updatedUser = res.data || res;

      setUser({
        ...user,
        nombre: updatedUser.nombre || nombre,
        apellido: updatedUser.apellido || apellido,
        telefono: updatedUser.telefono || telefono,
        codigoPais: updatedUser.codigoPais || codigoPais,
        ubicacion: updatedUser.ubicacion || ubicacion,
        nombreEmpresa: updatedUser.nombreEmpresa || nombreEmpresa,
        nit: updatedUser.nit || nit,
        cuentaBancaria: updatedUser.cuentaBancaria || cuentaBancaria,
      });

      setPersonalMsg({
        type: "success",
        text: "Datos personales actualizados correctamente.",
      });
      refetchUser();
    } catch (err) {
      setPersonalMsg({
        type: "error",
        text: err.message || "Error al actualizar perfil.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSecurityMsg({ type: "", text: "" });

    if (!contrasenaActual || !nuevaContrasena || !confirmarNueva) {
      setSecurityMsg({
        type: "error",
        text: "Todos los campos son obligatorios.",
      });
      return;
    }

    if (nuevaContrasena !== confirmarNueva) {
      setSecurityMsg({
        type: "error",
        text: "Las nuevas contraseÃ±as no coinciden.",
      });
      return;
    }

    setLoading(true);
    try {
      await api.put("/usuarios/me/contrasena", {
        contrasenaActual,
        nuevaContrasena,
      });
      setSecurityMsg({
        type: "success",
        text: "ContraseÃ±a actualizada correctamente.",
      });
      setContrasenaActual("");
      setNuevaContrasena("");
      setConfirmarNueva("");
    } catch (err) {
      setSecurityMsg({
        type: "error",
        text:
          err.message ||
          "Error al actualizar contraseÃ±a. Recuerde usar una mayÃºscula, un nÃºmero y un sÃ­mbolo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const detectarTipo = (numero) => {
    const n = numero.replace(/\s/g, "");
    if (/^4/.test(n)) return { tipo: "VISA", logo: "ðŸ’³", color: "#1A1F71" };
    if (/^5[1-5]|^2[2-7]/.test(n))
      return { tipo: "MASTERCARD", logo: "ðŸ’³", color: "#EB001B" };
    if (/^3[47]/.test(n)) return { tipo: "AMEX", logo: "ðŸ’³", color: "#007BC1" };
    if (/^3[068]/.test(n))
      return { tipo: "DINERS", logo: "ðŸ’³", color: "#004B87" };
    return null;
  };

  const validarLuhn = (numero) => {
    const n = numero.replace(/\s/g, "");
    let suma = 0;
    let impar = false;
    for (let i = n.length - 1; i >= 0; i--) {
      let digito = parseInt(n[i]);
      if (impar) {
        digito *= 2;
        if (digito > 9) digito -= 9;
      }
      suma += digito;
      impar = !impar;
    }
    return suma % 10 === 0;
  };

  const handleNumeroChange = (e) => {
    const valor = e.target.value.replace(/\D/g, "").substring(0, 16);
    const formateado = valor.replace(/(.{4})/g, "$1 ").trim();
    setNumeroTarjeta(formateado);
    const tipo = detectarTipo(valor);
    setTipoDetectado(tipo);
    const esValida = valor.length >= 13 && validarLuhn(valor);
    setTarjetaValida(esValida);
  };

  const handleSaveTarjeta = async (e) => {
    e.preventDefault();
    setCardMsg({ type: "", text: "" });
    if (!tarjetaValida) {
      setCardMsg({ type: "error", text: "NÃºmero de tarjeta invÃ¡lido." });
      return;
    }

    setLoading(true);
    try {
      await api.post("/tarjetas", {
        numero: numeroTarjeta.replace(/\s/g, ""),
        predeterminada: tarjetaPredeterminada,
      });
      setNumeroTarjeta("");
      setTipoDetectado(null);
      setTarjetaValida(false);
      setTarjetaPredeterminada(false);
      setTarjetaModalOpen(false);
      setCardMsg({ type: "success", text: "Tarjeta agregada exitosamente." });
      loadTarjetas();
    } catch (err) {
      setCardMsg({
        type: "error",
        text: err.message || "Error al agregar tarjeta.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTarjeta = async (cardId) => {
    if (!window.confirm("Â¿Desea eliminar esta tarjeta de sus mÃ©todos de pago?"))
      return;
    setCardMsg({ type: "", text: "" });
    try {
      await api.delete(`/tarjetas/${cardId}`);
      setCardMsg({ type: "success", text: "Tarjeta eliminada exitosamente." });
      loadTarjetas();
    } catch (err) {
      setCardMsg({
        type: "error",
        text: err.message || "Error al eliminar tarjeta.",
      });
    }
  };

  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    setPrefMsg({ type: "", text: "" });
    setLoading(true);
    try {
      const res = await api.put("/usuarios/mi-perfil", {
        divisaPreferida,
      });
      const updatedUser = res.data || res;
      setUser({
        ...user,
        divisaPreferida: updatedUser.divisaPreferida || divisaPreferida,
      });
      setDivisaActual(updatedUser.divisaPreferida || divisaPreferida);
      setPrefMsg({
        type: "success",
        text: "Preferencias actualizadas correctamente.",
      });
      refetchUser();
    } catch (err) {
      setPrefMsg({
        type: "error",
        text: err.message || "Error al actualizar preferencias.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { label: "", color: "#e0e0e0", width: "0%" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[@$!%*?&.]/.test(pass)) score += 1;

    if (score <= 1) return { label: "DÃ©bil", color: "#e53935", width: "33%" };
    if (score <= 3) return { label: "Media", color: "#ff9800", width: "66%" };
    return { label: "Fuerte", color: "#4caf50", width: "100%" };
  };

  const passwordStrength = getPasswordStrength(nuevaContrasena);

  const getPanelLink = () => {
    const role = user?.role?.toLowerCase();
    if (role === "productor") return "/dashboard-productor";
    if (role === "admin") return "/admin";
    return "/dashboard-comprador";
  };

  return (
    <>
      <Navbar />

      <main style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-title)",
                fontWeight: 800,
                fontSize: "2rem",
              }}
            >
              Mi Perfil
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Administra tu configuraciÃ³n personal, mÃ©todos de pago y seguridad
            </p>
          </div>
          <Link to={getPanelLink()} className="btn btn-secondary">
            â† Regresar al Panel
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: "32px",
          }}
          className="profile-grid"
        >
          {/* SETTINGS MENU */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              className={`btn ${activeTab === "personal" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("personal")}
              style={{ justifyContent: "flex-start", width: "100%" }}
            >
              Datos Personales
            </button>
            {user?.role?.toLowerCase() !== "productor" && (
              <button
                className={`btn ${activeTab === "tarjetas" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setActiveTab("tarjetas")}
                style={{ justifyContent: "flex-start", width: "100%" }}
              >
                MÃ©todos de Pago
              </button>
            )}
            <button
              className={`btn ${activeTab === "security" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("security")}
              style={{ justifyContent: "flex-start", width: "100%" }}
            >
              Seguridad y Acceso
            </button>
            {user?.role?.toLowerCase() !== "productor" && (
              <button
                className={`btn ${activeTab === "cupones" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setActiveTab("cupones")}
                style={{ justifyContent: "flex-start", width: "100%" }}
              >
                Mis Cupones
              </button>
            )}
            <button
              className={`btn ${activeTab === "preferencias" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("preferencias")}
              style={{ justifyContent: "flex-start", width: "100%" }}
            >
              Preferencias de Divisa
            </button>

            <div
              style={{
                marginTop: "24px",
                borderTop: "1px solid var(--border)",
                paddingTop: "16px",
                textAlign: "center",
              }}
            >
              <button
                className="btn btn-danger btn-sm"
                onClick={logout}
                style={{ width: "100%" }}
              >
                Cerrar SesiÃ³n
              </button>
            </div>
          </div>

          {/* TAB CONTENT */}
          <div
            className="card-table"
            style={{
              padding: "32px",
              background: "#fff",
              borderRadius: "var(--radius-lg)",
            }}
          >
            {/* 1. PERSONAL DETAILS */}
            {activeTab === "personal" && (
              <div>
                <h3
                  style={{
                    borderBottom: "1px solid var(--border)",
                    paddingBottom: "12px",
                    marginBottom: "24px",
                  }}
                >
                  InformaciÃ³n Personal
                </h3>

                {personalMsg.text && (
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "16px",
                      fontSize: "0.85rem",
                      background:
                        personalMsg.type === "success"
                          ? "var(--green-bg)"
                          : "var(--red-bg)",
                      color:
                        personalMsg.type === "success"
                          ? "var(--primary-dark)"
                          : "var(--red)",
                    }}
                  >
                    {personalMsg.text}
                  </div>
                )}

                <form
                  onSubmit={handleUpdatePersonal}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Nombre</label>
                      <input
                        className="form-input"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Apellido</label>
                      <input
                        className="form-input"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        Correo ElectrÃ³nico (No editable)
                      </label>
                      <input
                        className="form-input"
                        value={user?.email || ""}
                        style={{ background: "#f3f4f6", cursor: "not-allowed" }}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">TelÃ©fono</label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          className="form-input"
                          value={codigoPais}
                          style={{
                            maxWidth: "70px",
                            background: "#f3f4f6",
                            cursor: "not-allowed",
                            textAlign: "center",
                          }}
                          readOnly
                        />
                        <input
                          className="form-input"
                          value={telefono}
                          onChange={(e) => setTelefono(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Producer fields */}
                  {user?.role === "productor" && (
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">UbicaciÃ³n / Vereda</label>
                        <input
                          className="form-input"
                          value={ubicacion}
                          onChange={(e) => setUbicacion(e.target.value)}
                          placeholder="Ej. Vereda Las Margaritas, ChigorodÃ³"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          Cuenta Bancaria para Recibir Pagos
                        </label>
                        <input
                          className="form-input"
                          value={cuentaBancaria}
                          onChange={(e) => setCuentaBancaria(e.target.value)}
                          placeholder="Ej. Ahorros Bancolombia NÂ° 12345..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Company fields */}
                  {(user?.esEmpresa || user?.role === "comprador_empresa") && (
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">
                          Nombre de la Empresa
                        </label>
                        <input
                          className="form-input"
                          value={nombreEmpresa}
                          onChange={(e) => setNombreEmpresa(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">NIT</label>
                        <input
                          className="form-input"
                          value={nit}
                          onChange={(e) => setNit(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* DirecciÃ³n de EnvÃ­o para Compradores y Empresas */}
                  {user?.role !== "productor" && (
                    <div
                      style={{
                        background: "#fcfdfc",
                        border: "1px solid #eef2ee",
                        borderRadius: "12px",
                        padding: "20px",
                        marginTop: "16px",
                      }}
                    >
                      <h4
                        style={{
                          color: "#1b4332",
                          marginBottom: "16px",
                          fontWeight: "bold",
                        }}
                      >
                        DirecciÃ³n de EnvÃ­o
                      </h4>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Departamento</label>
                          <select
                            className="form-input"
                            value={departamento}
                            onChange={(e) => setDepartamento(e.target.value)}
                            style={{ height: "42px", background: "white" }}
                          >
                            <option value="">Selecciona departamento</option>
                            {[
                              "Amazonas",
                              "Antioquia",
                              "Arauca",
                              "AtlÃ¡ntico",
                              "BolÃ­var",
                              "BoyacÃ¡",
                              "Caldas",
                              "CaquetÃ¡",
                              "Casanare",
                              "Cauca",
                              "Cesar",
                              "ChocÃ³",
                              "CÃ³rdoba",
                              "Cundinamarca",
                              "GuainÃ­a",
                              "Guaviare",
                              "Huila",
                              "La Guajira",
                              "Magdalena",
                              "Meta",
                              "NariÃ±o",
                              "Norte de Santander",
                              "Putumayo",
                              "QuindÃ­o",
                              "Risaralda",
                              "San AndrÃ©s y Providencia",
                              "Santander",
                              "Sucre",
                              "Tolima",
                              "Valle del Cauca",
                              "VaupÃ©s",
                              "Vichada",
                              "BogotÃ¡ D.C.",
                            ]
                              .sort()
                              .map((dept) => (
                                <option key={dept} value={dept}>
                                  {dept}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Ciudad</label>
                          <input
                            className="form-input"
                            value={ciudad}
                            onChange={(e) => setCiudad(e.target.value)}
                            placeholder="Ej. MedellÃ­n"
                          />
                        </div>
                      </div>
                      <div className="form-group" style={{ marginTop: "16px" }}>
                        <label className="form-label">DirecciÃ³n Completa</label>
                        <input
                          className="form-input"
                          value={direccionCompleta}
                          onChange={(e) => setDireccionCompleta(e.target.value)}
                          placeholder="Ej. Calle 10 # 5-20, Apto 301"
                        />
                      </div>
                      <div className="form-row" style={{ marginTop: "16px" }}>
                        <div className="form-group">
                          <label className="form-label">
                            Puntos de Referencia
                          </label>
                          <input
                            className="form-input"
                            value={referencia}
                            onChange={(e) => setReferencia(e.target.value)}
                            placeholder="Ej. Junto a la panaderÃ­a"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">CÃ³digo Postal</label>
                          <input
                            className="form-input"
                            value={codigoPostal}
                            onChange={(e) => setCodigoPostal(e.target.value)}
                            placeholder="Ej. 05001"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={loading}
                    style={{ alignSelf: "flex-start", marginTop: "24px" }}
                  >
                    {loading ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </form>
              </div>
            )}

            {/* 2. PAYMENT METHODS */}
            {activeTab === "tarjetas" &&
              user?.role?.toLowerCase() !== "productor" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid var(--border)",
                      paddingBottom: "12px",
                      marginBottom: "24px",
                    }}
                  >
                    <h3>MÃ©todos de Pago</h3>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setTarjetaModalOpen(true)}
                    >
                      + Agregar Tarjeta
                    </button>
                  </div>

                  {cardMsg.text && (
                    <div
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        marginBottom: "16px",
                        fontSize: "0.85rem",
                        background:
                          cardMsg.type === "success"
                            ? "var(--green-bg)"
                            : "var(--red-bg)",
                        color:
                          cardMsg.type === "success"
                            ? "var(--primary-dark)"
                            : "var(--red)",
                      }}
                    >
                      {cardMsg.text}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    {tarjetas.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "32px 0",
                          color: "var(--text-muted)",
                        }}
                      >
                        <p
                          style={{ fontSize: "1.2rem", marginBottom: "8px" }}
                        ></p>
                        <p>No tienes tarjetas guardadas en este momento.</p>
                      </div>
                    ) : (
                      tarjetas.map((card) => (
                        <div
                          key={card.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "16px 20px",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius)",
                            background: "var(--surface2)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                            }}
                          >
                            <span style={{ fontSize: "1.8rem" }}></span>
                            <div>
                              <strong style={{ display: "block" }}>
                                {card.tipoTarjeta} â€¢â€¢â€¢â€¢{" "}
                                {card.ultimosCuatroDigitos}
                              </strong>
                              {card.predeterminada && (
                                <span
                                  style={{
                                    background: "var(--green-bg)",
                                    color: "var(--primary-dark)",
                                    fontSize: "0.7rem",
                                    fontWeight: "bold",
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                    border: "1px solid #c6f6d5",
                                    marginTop: "4px",
                                    display: "inline-block",
                                  }}
                                >
                                  Predeterminada
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteTarjeta(card.id)}
                            style={{
                              color: "var(--red)",
                              background: "transparent",
                              border: "1px solid var(--red)",
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            {/* 3. SECURITY & ACCESS */}
            {activeTab === "security" && (
              <div>
                <h3
                  style={{
                    borderBottom: "1px solid var(--border)",
                    paddingBottom: "12px",
                    marginBottom: "24px",
                  }}
                >
                  Seguridad de la Cuenta
                </h3>

                {securityMsg.text && (
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "16px",
                      fontSize: "0.85rem",
                      background:
                        securityMsg.type === "success"
                          ? "var(--green-bg)"
                          : "var(--red-bg)",
                      color:
                        securityMsg.type === "success"
                          ? "var(--primary-dark)"
                          : "var(--red)",
                    }}
                  >
                    {securityMsg.text}
                  </div>
                )}

                <form
                  onSubmit={handleUpdatePassword}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    maxWidth: "500px",
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">ContraseÃ±a Actual</label>
                    <div style={{ position: "relative" }}>
                      <input
                        className="form-input"
                        type={showCurrentPassword ? "text" : "password"}
                        value={contrasenaActual}
                        onChange={(e) => setContrasenaActual(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "1.1rem",
                        }}
                      >
                        {showCurrentPassword ? "ðŸ‘ï¸" : "ðŸ™ˆ"}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nueva ContraseÃ±a</label>
                    <div style={{ position: "relative" }}>
                      <input
                        className="form-input"
                        type={showNewPassword ? "text" : "password"}
                        value={nuevaContrasena}
                        onChange={(e) => setNuevaContrasena(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "1.1rem",
                        }}
                      >
                        {showNewPassword ? "ðŸ‘ï¸" : "ðŸ™ˆ"}
                      </button>
                    </div>

                    {/* PASSWORD STRENGTH BAR */}
                    {nuevaContrasena && (
                      <div>
                        <div className="password-strength-bar">
                          <div
                            className="password-strength-fill"
                            style={{
                              width: passwordStrength.width,
                              backgroundColor: passwordStrength.color,
                            }}
                          />
                        </div>
                        <span
                          className="password-strength-text"
                          style={{ color: passwordStrength.color }}
                        >
                          Fortaleza: {passwordStrength.label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Confirmar Nueva ContraseÃ±a
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        className="form-input"
                        type={showConfirmNew ? "text" : "password"}
                        value={confirmarNueva}
                        onChange={(e) => setConfirmarNueva(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNew(!showConfirmNew)}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "1.1rem",
                        }}
                      >
                        {showConfirmNew ? "ðŸ‘ï¸" : "ðŸ™ˆ"}
                      </button>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={loading}
                    style={{ alignSelf: "flex-start", marginTop: "16px" }}
                  >
                    Cambiar ContraseÃ±a
                  </button>
                </form>
              </div>
            )}

            {/* 4. ACTIVE COUPONS */}
            {activeTab === "cupones" &&
              user?.role?.toLowerCase() !== "productor" && (
                <div>
                  <h3
                    style={{
                      borderBottom: "1px solid var(--border)",
                      paddingBottom: "12px",
                      marginBottom: "24px",
                    }}
                  >
                    Mis Cupones de Descuento
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {cupones.length === 0 ? (
                      <div
                        style={{
                          gridColumn: "1 / -1",
                          textAlign: "center",
                          padding: "32px 0",
                          color: "var(--text-muted)",
                        }}
                      >
                        <p
                          style={{ fontSize: "1.2rem", marginBottom: "8px" }}
                        ></p>
                        <p>No tienes cupones disponibles.</p>
                      </div>
                    ) : (
                      cupones.map((c) => (
                        <div
                          key={c.id}
                          style={{
                            background:
                              "linear-gradient(135deg, #f0fdf4 0%, #e8f5e9 100%)",
                            border: "1.5px dashed #4caf50",
                            borderRadius: "12px",
                            padding: "20px",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              color: "var(--primary-dark)",
                              fontWeight: "bold",
                            }}
                          >
                            CUPÃ“N DISPONIBLE
                          </div>
                          <div
                            style={{
                              fontSize: "1.6rem",
                              fontWeight: "800",
                              color: "var(--text)",
                              margin: "8px 0",
                            }}
                          >
                            {c.codigo}
                          </div>
                          <p
                            style={{
                              fontSize: "0.85rem",
                              color: "var(--text-muted)",
                              marginBottom: "12px",
                            }}
                          >
                            {c.descripcion ||
                              `Descuento del ${c.porcentajeDescuento}% en tu pedido.`}
                          </p>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              fontSize: "0.75rem",
                              color: "var(--text-dim)",
                            }}
                          >
                            <span>
                              Valor: <strong>{c.porcentajeDescuento}%</strong>
                            </span>
                            <span>
                              Estado:{" "}
                              <strong
                                style={{
                                  color: c.usado
                                    ? "var(--red)"
                                    : "var(--primary-dark)",
                                }}
                              >
                                {c.usado ? "Usado" : "Activo"}
                              </strong>
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            {/* 5. PREFERENCES OF CURRENCY */}
            {activeTab === "preferencias" && (
              <div>
                <h3
                  style={{
                    borderBottom: "1px solid var(--border)",
                    paddingBottom: "12px",
                    marginBottom: "24px",
                  }}
                >
                  Preferencias del Sistema
                </h3>

                {prefMsg.text && (
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "16px",
                      fontSize: "0.85rem",
                      background:
                        prefMsg.type === "success"
                          ? "var(--green-bg)"
                          : "var(--red-bg)",
                      color:
                        prefMsg.type === "success"
                          ? "var(--primary-dark)"
                          : "var(--red)",
                    }}
                  >
                    {prefMsg.text}
                  </div>
                )}

                <form
                  onSubmit={handleUpdatePreferences}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    maxWidth: "500px",
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Divisa Preferida</label>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        marginBottom: "12px",
                      }}
                    >
                      Selecciona la divisa en la que deseas visualizar los
                      precios del catÃ¡logo y tus transacciones en la plataforma.
                    </p>
                    <select
                      className="form-select"
                      value={divisaPreferida}
                      onChange={(e) => setDivisaPreferida(e.target.value)}
                    >
                      {DIVISAS.map((d) => (
                        <option key={d.codigo} value={d.codigo}>
                          {d.bandera} {d.codigo} â€” {d.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={loading}
                    style={{ alignSelf: "flex-start", marginTop: "16px" }}
                  >
                    Guardar Preferencias
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL AGREGAR TARJETA */}
      {tarjetaModalOpen && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Registrar Tarjeta de Pago</span>
              <button
                className="modal-close"
                onClick={() => setTarjetaModalOpen(false)}
              >
                âœ•
              </button>
            </div>
            <form onSubmit={handleSaveTarjeta}>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label">NÃºmero de Tarjeta</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={numeroTarjeta}
                    onChange={handleNumeroChange}
                    required
                  />
                  {tipoDetectado && (
                    <span
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontWeight: "bold",
                        color: tipoDetectado.color,
                      }}
                    >
                      {tipoDetectado.tipo}
                    </span>
                  )}
                </div>
                {numeroTarjeta.replace(/\s/g, "").length >= 13 && (
                  <span
                    style={{
                      color: tarjetaValida ? "green" : "red",
                      fontSize: "12px",
                      display: "block",
                      marginTop: "4px",
                    }}
                  >
                    {tarjetaValida ? "âœ“ Tarjeta vÃ¡lida" : "âœ— NÃºmero invÃ¡lido"}
                  </span>
                )}
              </div>

              <div
                className="form-group"
                style={{
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <input
                  type="checkbox"
                  id="tarjetaPredeterminada"
                  checked={tarjetaPredeterminada}
                  onChange={(e) => setTarjetaPredeterminada(e.target.checked)}
                  style={{ width: "18px", height: "18px" }}
                />
                <label
                  htmlFor="tarjetaPredeterminada"
                  style={{ fontSize: "0.9rem", cursor: "pointer" }}
                >
                  Establecer como predeterminada
                </label>
              </div>

              <div
                className="modal-footer"
                style={{ display: "flex", gap: "12px" }}
              >
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setTarjetaModalOpen(false)}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={loading || !tarjetaValida}
                  style={{ flex: 2 }}
                >
                  Registrar Tarjeta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}



