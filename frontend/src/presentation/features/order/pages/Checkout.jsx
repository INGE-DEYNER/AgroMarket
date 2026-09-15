import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/hooks/useAuth";
import { useCart } from "@/presentation/features/order/hooks/useCart";
import { usePriceDisplay } from "@/app/hooks/usePriceDisplay";
import api from "@/infrastructure/http/api";
import BuyerShell from "@/presentation/features/order/components/BuyerShell";

export default function Checkout() {
  const { user, formatPrice, refetchUser } = useAuth();
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  /*
   * Costo de envío provisto por el BACKEND (GET /envios/config).
   * El backend es la fuente de verdad del total: al crear el pedido,
   * el servidor aplica este mismo valor (una sola vez por checkout)
   * y recalcula el total, ignorando cualquier valor enviado por el cliente.
   */
  const [costoEnvio, setCostoEnvio] = useState(15000);

  useEffect(() => {
    let mounted = true;

    api
      .get("/envios/config")
      .then((res) => {
        const data = res?.data || res;
        const valor = Number(data?.costoEnvio);
        if (mounted && Number.isFinite(valor) && valor >= 0) {
          setCostoEnvio(valor);
        }
      })
      .catch((err) =>
        console.error("No se pudo cargar el costo de envío:", err),
      );

    return () => {
      mounted = false;
    };
  }, []);

  // Step 2 Address State
  const [addressForm, setAddressForm] = useState({
    departamento: "",
    ciudad: "",
    direccionCompleta: "",
    referencia: "",
    codigoPostal: "",
  });

  // Load defaults from user profile
  useEffect(() => {
    if (user) {
      setAddressForm({
        departamento: user.departamento || "",
        ciudad: user.ciudad || "",
        direccionCompleta: user.direccionCompleta || "",
        referencia: user.referencia || "",
        codigoPostal: user.codigoPostal || "",
      });
    }
  }, [user]);

  // Step 3 Payment State
  const [metodoPago, setMetodoPago] = useState("MERCADO_PAGO");
  const [pseForm, setPseForm] = useState({
    banco: "Bancolombia",
    tipoPersona: "NATURAL",
    tipoCuenta: "AHORROS",
    numeroCuenta: "",
  });
  const [tarjetaForm, setTarjetaForm] = useState({
    numero: "",
    nombre: "",
    fecha: "",
    cvv: "",
  });
  const [nequiForm, setNequiForm] = useState({ celular: "" });
  const [daviplataForm, setDaviplataForm] = useState({ celular: "" });
  const [formErrors, setFormErrors] = useState({});

  // Helper: Luhn Algorithm Validation
  const validateLuhn = (num) => {
    let sum = 0;
    let doubleUp = false;
    const cleanNum = num.replace(/\s+/g, "");
    for (let i = cleanNum.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNum.charAt(i), 10);
      if (doubleUp) {
        if ((digit *= 2) > 9) digit -= 9;
      }
      sum += digit;
      doubleUp = !doubleUp;
    }
    return sum % 10 === 0;
  };

  // Local Shipping Calculator
  const getDeliveryDays = (ciudad) => {
    if (!ciudad) return 4;
    const clean = ciudad
      .toLowerCase()
      .trim()
      .replace("á", "a")
      .replace("é", "e")
      .replace("í", "i")
      .replace("ó", "o")
      .replace("ú", "u");
    const map = {
      chigorodo: 1,
      apartado: 1,
      turbo: 1,
      carepa: 1,
      medellin: 2,
      bello: 2,
      itagui: 2,
      envigado: 2,
      bogota: 3,
      cali: 3,
      barranquilla: 3,
      cartagena: 3,
      bucaramanga: 4,
      cucuta: 4,
      pasto: 4,
      manizales: 3,
    };
    return map[clean] || 4;
  };

  const getEstimatedDate = () => {
    const days = getDeliveryDays(addressForm.ciudad);
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Form Validations
  const validateStep2 = () => {
    const errors = {};
    if (!addressForm.departamento.trim())
      errors.departamento = "El departamento es obligatorio";
    if (!addressForm.ciudad.trim()) errors.ciudad = "La ciudad es obligatoria";
    if (!addressForm.direccionCompleta.trim())
      errors.direccionCompleta = "La dirección es obligatoria";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors = {};
    if (metodoPago === "PSE") {
      if (!pseForm.numeroCuenta.trim())
        errors.numeroCuenta = "El número de cuenta es obligatorio";
    } else if (metodoPago === "TARJETA") {
      if (!tarjetaForm.numero.trim() || tarjetaForm.numero.length < 13)
        errors.tarjetaNumero = "Número de tarjeta inválido";
      else if (!validateLuhn(tarjetaForm.numero))
        errors.tarjetaNumero = "Número de tarjeta falló la validación Luhn";
      if (!tarjetaForm.nombre.trim())
        errors.tarjetaNombre = "El nombre del titular es obligatorio";
      if (
        !tarjetaForm.fecha.trim() ||
        !/^\d{2}\/\d{2}$/.test(tarjetaForm.fecha)
      )
        errors.tarjetaFecha = "Formato MM/AA obligatorio";
      if (!tarjetaForm.cvv.trim() || tarjetaForm.cvv.length < 3)
        errors.tarjetaCvv = "CVV inválido";
    } else if (metodoPago === "NEQUI") {
      if (!nequiForm.celular.trim() || nequiForm.celular.length < 10)
        errors.nequiCelular = "Número celular inválido";
    } else if (metodoPago === "DAVIPLATA") {
      if (!daviplataForm.celular.trim() || daviplataForm.celular.length < 10)
        errors.daviplataCelular = "Número celular inválido";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (cart.length === 0) return;
      setStep(2);
    } else if (step === 2) {
      if (!validateStep2()) return;
      // Save address to profile in background
      try {
        await api.put("/usuarios/me", {
          nombre: user.nombre,
          telefono: user.telefono,
          departamento: addressForm.departamento,
          ciudad: addressForm.ciudad,
          direccionCompleta: addressForm.direccionCompleta,
          referencia: addressForm.referencia,
          codigoPostal: addressForm.codigoPostal,
        });
        refetchUser();
      } catch (err) {
        console.error("Error saving address:", err);
      }
      setStep(3);
    } else if (step === 3) {
      if (!validateStep3()) return;
      setStep(4);
    }
  };

  const handlePayNow = async () => {
    // Guard de reentrada: evita pagos duplicados por dobles clicks
    if (loading) return;
    setLoading(true);
    try {
      const localCheckoutId = `CHK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const completedOrders = [];
      let gatewayRedirectUrl = null;

      for (const item of cart) {
        const orderRes = await api.post("/pedidos", {
          productId: item.id,
          productoId: item.id,
          quantity: item.qty,
          cantidad: item.qty,
          buyerId: user?.id,
          compradorId: user?.id,
          shippingAddress: addressForm.direccionCompleta || user?.direccionCompleta || "Dirección de entrega",
          direccionCompleta: addressForm.direccionCompleta || user?.direccionCompleta || "Dirección de entrega",
          checkoutId: localCheckoutId,
        });
        const order = orderRes.data || orderRes;

        const initRes = await api.post("/pagos/iniciar", {
          orderId: order.id,
          pedidoId: order.id,
          buyerId: user?.id,
          compradorId: user?.id,
          paymentMethod: metodoPago === "TARJETA" ? "CREDIT_CARD" : metodoPago,
          metodoPago: metodoPago,
        });
        const init = initRes.data || initRes;

        if (init?.checkoutUrl) {
          gatewayRedirectUrl = init.checkoutUrl;
        } else if (init?.reference) {
          gatewayRedirectUrl = `/pago-pasarela?preference_id=${encodeURIComponent(init.reference)}`;
        }
        completedOrders.push(order.id);
      }

      clearCart();

      // Redirigir al proceso de pago oficial en la pasarela de Mercado Pago
      if (gatewayRedirectUrl) {
        if (gatewayRedirectUrl.startsWith("http://") || gatewayRedirectUrl.startsWith("https://")) {
          window.location.href = gatewayRedirectUrl;
        } else {
          navigate(gatewayRedirectUrl);
        }
        return;
      }

      const txnId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSuccessData({
        txnId,
        checkoutId: localCheckoutId,
        orders: completedOrders,
        deliveryDate: getEstimatedDate(),
      });
    } catch (err) {
      let msg = err.message || "Inténtalo de nuevo.";

      // Mensajes claros según el tipo de error real
      if (err.status === 401) {
        msg =
          "Tu sesión expiró. Por favor inicia sesión nuevamente para continuar con el pago.";
      } else if (
        /credenciales|MERCADOPAGO_ACCESS_TOKEN|inválido o expirado|unauthorized_scopes|PolicyAgent/i.test(
          msg,
        )
      ) {
        msg =
          "MercadoPago rechazó las credenciales del servidor. " +
          "El administrador debe generar un nuevo Access Token en https://developers.mercadopago.com " +
          "y actualizar el archivo .env del backend.";
      }

      alert("Hubo un error al iniciar el pago: " + msg);

      if (err.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <BuyerShell activeKey="checkout">
      <div
        className="buyer-checkout-page"
        style={{
          background: "#f4fbf7",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            flex: 1,
            maxWidth: "600px",
            width: "100%",
            margin: "60px auto",
            padding: "0 20px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(45, 106, 79, 0.05)",
              border: "1px solid #eef2ee",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "#52b788",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px auto",
                fontSize: "2.5rem",
              }}
            >
              ✓
            </div>
            <h1
              style={{
                color: "#1b4332",
                fontSize: "2rem",
                fontWeight: "800",
                marginBottom: "8px",
              }}
            >
              ¡Pago Confirmado!
            </h1>
            <p
              style={{
                color: "#718096",
                fontSize: "1rem",
                marginBottom: "32px",
              }}
            >
              Tu transacción ha sido aprobada y la factura ha sido enviada a tu
              correo electrónico.
            </p>

            <div
              style={{
                background: "#f4fbf7",
                borderRadius: "12px",
                padding: "24px",
                textAlign: "left",
                marginBottom: "32px",
                border: "1px solid #e2ece2",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  fontSize: "0.95rem",
                }}
              >
                <span style={{ color: "#718096" }}>ID Transacción:</span>
                <strong style={{ color: "#1b4332" }}>
                  {successData.txnId}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  fontSize: "0.95rem",
                }}
              >
                <span style={{ color: "#718096" }}>
                  ID de Pedido (Checkout):
                </span>
                <strong style={{ color: "#1b4332" }}>
                  {successData.checkoutId}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  fontSize: "0.95rem",
                }}
              >
                <span style={{ color: "#718096" }}>Estado:</span>
                <strong
                  style={{
                    color: "#2d6a4f",
                    background: "#d8f3dc",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                  }}
                >
                  APROBADO
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.95rem",
                }}
              >
                <span style={{ color: "#718096" }}>Entrega Estimada:</span>
                <strong style={{ color: "#1b4332", textAlign: "right" }}>
                  {successData.deliveryDate}
                </strong>
              </div>
            </div>

            <button
              onClick={() => navigate("/pedidos")}
              style={{
                width: "100%",
                background: "#2d6a4f",
                color: "white",
                border: "none",
                padding: "14px",
                borderRadius: "30px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(45, 106, 79, 0.2)",
              }}
            >
              Ver mis pedidos
            </button>
          </div>
        </div>
      </div>
      </BuyerShell>
    );
  }

  return (
    <BuyerShell activeKey="checkout">
    <div
      className="buyer-checkout-page"
      style={{
        background: "#f4fbf7",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          flex: 1,
          maxWidth: "900px",
          width: "100%",
          margin: "40px auto",
          padding: "0 20px",
        }}
      >
        {/* Step Indicator Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "40px",
            position: "relative",
          }}
        >
          {[
            { s: 1, label: "Resumen" },
            { s: 2, label: "Dirección" },
            { s: 3, label: "Pago" },
            { s: 4, label: "Confirmación" },
          ].map((item) => (
            <div
              key={item.s}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: step >= item.s ? "#2d6a4f" : "white",
                  color: step >= item.s ? "white" : "#718096",
                  border: "2px solid #2d6a4f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                {item.s}
              </div>
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: step === item.s ? "bold" : "500",
                  color: step === item.s ? "#1b4332" : "#718096",
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
          <div
            style={{
              position: "absolute",
              top: "18px",
              left: "12%",
              right: "12%",
              height: "2px",
              background: "#e2ece2",
              zIndex: 1,
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.7fr 1fr",
            gap: "30px",
          }}
          className="checkout-grid"
        >
          {/* Main Steps Panels */}
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "16px",
              border: "1px solid #eef2ee",
              boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
            }}
          >
            {/* Step 1: Summary */}
            {step === 1 && (
              <div>
                <h2
                  style={{
                    color: "#1b4332",
                    fontSize: "1.4rem",
                    fontWeight: "800",
                    marginBottom: "20px",
                  }}
                >
                  Resumen del Pedido
                </h2>
                {cart.length === 0 ? (
                  <p style={{ color: "#718096", fontStyle: "italic" }}>
                    Tu carrito está vacío.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      marginBottom: "30px",
                    }}
                  >
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingBottom: "12px",
                          borderBottom: "1px solid #f0f4f0",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "bold", color: "#1b4332" }}>
                            {item.nombre}
                          </div>
                          <div
                            style={{ fontSize: "0.85rem", color: "#718096" }}
                          >
                            Cantidad: {item.qty} kg
                          </div>
                        </div>
                        <span style={{ fontWeight: "500", color: "#2d6a4f" }}>
                          {formatPrice(
                            (item.precioPromocion || item.precio) * item.qty,
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {cart.length > 0 && (
                  <div
                    style={{
                      borderTop: "1px solid #eef2ee",
                      paddingTop: "16px",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.95rem",
                        color: "#718096",
                        marginBottom: "8px",
                      }}
                    >
                      <span>Subtotal</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.95rem",
                        color: "#718096",
                        marginBottom: "8px",
                      }}
                    >
                      <span>Envío</span>
                      <span>{formatPrice(costoEnvio)}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "1.1rem",
                        fontWeight: "800",
                      }}
                    >
                      <span style={{ color: "#1b4332" }}>Total</span>
                      <span style={{ color: "#2d6a4f" }}>
                        {formatPrice(total + costoEnvio)}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                        marginTop: "8px",
                      }}
                    >
                      El envío se cobra una sola vez por compra.
                    </p>
                  </div>
                )}

                <button className="btn-primary-chk" onClick={handleNextStep}>
                  Continuar
                </button>
              </div>
            )}

            {/* Step 2: Shipping Address */}
            {step === 2 && (
              <div>
                <h2
                  style={{
                    color: "#1b4332",
                    fontSize: "1.4rem",
                    fontWeight: "800",
                    marginBottom: "20px",
                  }}
                >
                  Dirección de Envío
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    marginBottom: "30px",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                    className="form-row"
                  >
                    <div>
                      <label className="form-lbl">Departamento *</label>
                      <select
                        value={addressForm.departamento}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            departamento: e.target.value,
                          })
                        }
                        className="form-in"
                        style={{ height: "44px", background: "white" }}
                      >
                        <option value="">Selecciona departamento</option>
                        {[
                          "Amazonas",
                          "Antioquia",
                          "Arauca",
                          "Atlántico",
                          "Bolívar",
                          "Boyacá",
                          "Caldas",
                          "Caquetá",
                          "Casanare",
                          "Cauca",
                          "Cesar",
                          "Chocó",
                          "Córdoba",
                          "Cundinamarca",
                          "Guainía",
                          "Guaviare",
                          "Huila",
                          "La Guajira",
                          "Magdalena",
                          "Meta",
                          "Nariño",
                          "Norte de Santander",
                          "Putumayo",
                          "Quindío",
                          "Risaralda",
                          "San Andrés y Providencia",
                          "Santander",
                          "Sucre",
                          "Tolima",
                          "Valle del Cauca",
                          "Vaupés",
                          "Vichada",
                          "Bogotá D.C.",
                        ]
                          .sort()
                          .map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                      </select>
                      {formErrors.departamento && (
                        <span className="form-err">
                          {formErrors.departamento}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="form-lbl">Ciudad *</label>
                      <input
                        type="text"
                        value={addressForm.ciudad}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            ciudad: e.target.value,
                          })
                        }
                        className="form-in"
                        placeholder="Ej. Medellín"
                      />
                      {formErrors.ciudad && (
                        <span className="form-err">{formErrors.ciudad}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="form-lbl">Dirección Completa *</label>
                    <input
                      type="text"
                      value={addressForm.direccionCompleta}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          direccionCompleta: e.target.value,
                        })
                      }
                      className="form-in"
                      placeholder="Calle, número, apto, barrio"
                    />
                    {formErrors.direccionCompleta && (
                      <span className="form-err">
                        {formErrors.direccionCompleta}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.5fr 1fr",
                      gap: "16px",
                    }}
                    className="form-row"
                  >
                    <div>
                      <label className="form-lbl">Puntos de Referencia</label>
                      <input
                        type="text"
                        value={addressForm.referencia}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            referencia: e.target.value,
                          })
                        }
                        className="form-in"
                        placeholder="Ej. Frente al parque principal"
                      />
                    </div>
                    <div>
                      <label className="form-lbl">Código Postal</label>
                      <input
                        type="text"
                        value={addressForm.codigoPostal}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            codigoPostal: e.target.value,
                          })
                        }
                        className="form-in"
                        placeholder="05001"
                      />
                    </div>
                  </div>

                  {addressForm.ciudad && (
                    <div
                      style={{
                        marginTop: "10px",
                        background: "#f4fbf7",
                        border: "1px dashed #52b788",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        color: "#1b4332",
                      }}
                    >
                      📅 <strong>Fecha estimada de entrega:</strong>{" "}
                      {getEstimatedDate()}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <button
                    className="btn-secondary-chk"
                    onClick={() => setStep(1)}
                  >
                    Atrás
                  </button>
                  <button className="btn-primary-chk" onClick={handleNextStep}>
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Method */}
            {step === 3 && (
              <div>
                <h2
                  style={{
                    color: "#1b4332",
                    fontSize: "1.4rem",
                    fontWeight: "800",
                    marginBottom: "20px",
                  }}
                >
                  Método de Pago
                </h2>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "24px",
                    overflowX: "auto",
                    paddingBottom: "8px",
                  }}
                >
                  {["MERCADO_PAGO", "PSE", "TARJETA", "NEQUI", "DAVIPLATA"].map((method) => (
                    <button
                      key={method}
                      onClick={() => {
                        setMetodoPago(method);
                        setFormErrors({});
                      }}
                      style={{
                        background: metodoPago === method ? (method === "MERCADO_PAGO" ? "#009ee3" : "#d8f3dc") : "white",
                        color: metodoPago === method ? "#ffffff" : "#718096",
                        border:
                          metodoPago === method
                            ? (method === "MERCADO_PAGO" ? "2px solid #0072bb" : "2px solid #2d6a4f")
                            : "1px solid #e2e8f0",
                        padding: "12px 20px",
                        borderRadius: "10px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        boxShadow: metodoPago === method && method === "MERCADO_PAGO" ? "0 4px 12px rgba(0,158,227,0.3)" : "none",
                      }}
                    >
                      {method === "MERCADO_PAGO" ? "💳 Mercado Pago" : method}
                    </button>
                  ))}
                </div>

                <div style={{ marginBottom: "30px" }}>
                  {/* Mercado Pago Fields */}
                  {metodoPago === "MERCADO_PAGO" && (
                    <div
                      style={{
                        background: "linear-gradient(135deg, #009ee3 0%, #0072bb 100%)",
                        color: "#ffffff",
                        borderRadius: "14px",
                        padding: "24px",
                        boxShadow: "0 8px 24px rgba(0,158,227,0.25)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "1.8rem" }}>💳</span>
                          <div>
                            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "800", color: "#ffffff" }}>
                              Mercado Pago
                            </h3>
                            <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.85)" }}>
                              Pasarela Oficial de Pago Recomendada
                            </span>
                          </div>
                        </div>
                        <span
                          style={{
                            background: "#00a650",
                            color: "#ffffff",
                            fontSize: "0.75rem",
                            fontWeight: "800",
                            padding: "4px 10px",
                            borderRadius: "99px",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          ✓ Seguro SSL 256-bit
                        </span>
                      </div>

                      <p style={{ fontSize: "0.9rem", lineHeight: 1.5, margin: 0, color: "rgba(255,255,255,0.95)" }}>
                        Con <strong>Mercado Pago</strong> tu transacción está protegida al 100%. Podrás abonar con tus tarjetas de crédito o débito, PSE, Nequi o tu saldo disponible en Mercado Pago con garantía total de protección al comprador.
                      </p>

                      <div
                        style={{
                          background: "rgba(255,255,255,0.15)",
                          backdropFilter: "blur(6px)",
                          borderRadius: "10px",
                          padding: "12px 16px",
                          fontSize: "0.85rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span>🔒</span>
                        <span>Tus datos financieros están encriptados y protegidos de extremo a extremo por Mercado Pago.</span>
                      </div>
                    </div>
                  )}
                  {/* PSE Fields */}
                  {metodoPago === "PSE" && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "16px",
                        }}
                        className="form-row"
                      >
                        <div>
                          <label className="form-lbl">Banco</label>
                          <select
                            value={pseForm.banco}
                            onChange={(e) =>
                              setPseForm({ ...pseForm, banco: e.target.value })
                            }
                            className="form-in"
                          >
                            <option>Bancolombia</option>
                            <option>Banco de Bogotá</option>
                            <option>Davivienda</option>
                            <option>BBVA</option>
                            <option>Lulo Bank</option>
                          </select>
                        </div>
                        <div>
                          <label className="form-lbl">Tipo Persona</label>
                          <select
                            value={pseForm.tipoPersona}
                            onChange={(e) =>
                              setPseForm({
                                ...pseForm,
                                tipoPersona: e.target.value,
                              })
                            }
                            className="form-in"
                          >
                            <option value="NATURAL">Natural</option>
                            <option value="JURIDICA">Jurídica</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="form-lbl">
                          Número de Celular / Cuenta *
                        </label>
                        <input
                          type="text"
                          placeholder="Ingresa tu número de cuenta asociada"
                          value={pseForm.numeroCuenta}
                          onChange={(e) =>
                            setPseForm({
                              ...pseForm,
                              numeroCuenta: e.target.value,
                            })
                          }
                          className="form-in"
                        />
                        {formErrors.numeroCuenta && (
                          <span className="form-err">
                            {formErrors.numeroCuenta}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Card Fields */}
                  {metodoPago === "TARJETA" && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <label className="form-lbl">Número de Tarjeta *</label>
                        <input
                          type="text"
                          placeholder="4000 1234 5678 9010"
                          value={tarjetaForm.numero}
                          onChange={(e) =>
                            setTarjetaForm({
                              ...tarjetaForm,
                              numero: e.target.value.replace(/\D/g, ""),
                            })
                          }
                          className="form-in"
                        />
                        {formErrors.tarjetaNumero && (
                          <span className="form-err">
                            {formErrors.tarjetaNumero}
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="form-lbl">Nombre del Titular *</label>
                        <input
                          type="text"
                          placeholder="Juan Pérez"
                          value={tarjetaForm.nombre}
                          onChange={(e) =>
                            setTarjetaForm({
                              ...tarjetaForm,
                              nombre: e.target.value,
                            })
                          }
                          className="form-in"
                        />
                        {formErrors.tarjetaNombre && (
                          <span className="form-err">
                            {formErrors.tarjetaNombre}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "16px",
                        }}
                        className="form-row"
                      >
                        <div>
                          <label className="form-lbl">
                            Fecha Expiración (MM/AA) *
                          </label>
                          <input
                            type="text"
                            placeholder="12/29"
                            value={tarjetaForm.fecha}
                            onChange={(e) =>
                              setTarjetaForm({
                                ...tarjetaForm,
                                fecha: e.target.value,
                              })
                            }
                            className="form-in"
                          />
                          {formErrors.tarjetaFecha && (
                            <span className="form-err">
                              {formErrors.tarjetaFecha}
                            </span>
                          )}
                        </div>
                        <div>
                          <label className="form-lbl">CVV *</label>
                          <input
                            type="password"
                            placeholder="123"
                            maxLength="4"
                            value={tarjetaForm.cvv}
                            onChange={(e) =>
                              setTarjetaForm({
                                ...tarjetaForm,
                                cvv: e.target.value.replace(/\D/g, ""),
                              })
                            }
                            className="form-in"
                          />
                          {formErrors.tarjetaCvv && (
                            <span className="form-err">
                              {formErrors.tarjetaCvv}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nequi Fields */}
                  {metodoPago === "NEQUI" && (
                    <div>
                      <label className="form-lbl">Número Celular Nequi *</label>
                      <input
                        type="text"
                        placeholder="300 123 4567"
                        value={nequiForm.celular}
                        onChange={(e) =>
                          setNequiForm({
                            ...nequiForm,
                            celular: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        className="form-in"
                      />
                      {formErrors.nequiCelular && (
                        <span className="form-err">
                          {formErrors.nequiCelular}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Daviplata Fields */}
                  {metodoPago === "DAVIPLATA" && (
                    <div>
                      <label className="form-lbl">
                        Número Celular Daviplata *
                      </label>
                      <input
                        type="text"
                        placeholder="300 123 4567"
                        value={daviplataForm.celular}
                        onChange={(e) =>
                          setDaviplataForm({
                            ...daviplataForm,
                            celular: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        className="form-in"
                      />
                      {formErrors.daviplataCelular && (
                        <span className="form-err">
                          {formErrors.daviplataCelular}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "16px" }}>
                  <button
                    className="btn-secondary-chk"
                    onClick={() => setStep(2)}
                  >
                    Atrás
                  </button>
                  <button className="btn-primary-chk" onClick={handleNextStep}>
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div>
                <h2
                  style={{
                    color: "#1b4332",
                    fontSize: "1.4rem",
                    fontWeight: "800",
                    marginBottom: "20px",
                  }}
                >
                  Confirmación
                </h2>
                <p
                  style={{
                    color: "#718096",
                    fontSize: "0.95rem",
                    marginBottom: "24px",
                  }}
                >
                  Revisa detalladamente la información del envío y el método de
                  pago antes de proceder con el cobro.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    background: "#f8fafc",
                    padding: "20px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    marginBottom: "30px",
                  }}
                >
                  <div>
                    <strong style={{ color: "#1b4332", fontSize: "0.9rem" }}>
                      Dirección de Envío:
                    </strong>
                    <div
                      style={{
                        color: "#4a5568",
                        marginTop: "4px",
                        fontSize: "0.9rem",
                      }}
                    >
                      {addressForm.direccionCompleta}, {addressForm.ciudad},{" "}
                      {addressForm.departamento}
                      {addressForm.referencia && ` (${addressForm.referencia})`}
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: "#1b4332", fontSize: "0.9rem" }}>
                      Método de Pago:
                    </strong>
                    <div
                      style={{
                        color: "#4a5568",
                        marginTop: "4px",
                        fontSize: "0.9rem",
                      }}
                    >
                      {metodoPago} -{" "}
                      {metodoPago === "PSE"
                        ? pseForm.numeroCuenta
                        : metodoPago === "TARJETA"
                          ? "Tarjetas Visa/MC"
                          : metodoPago === "NEQUI"
                            ? nequiForm.celular
                            : daviplataForm.celular}
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: "#1b4332", fontSize: "0.9rem" }}>
                      Entrega Estimada:
                    </strong>
                    <div
                      style={{
                        color: "#2d6a4f",
                        marginTop: "4px",
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                      }}
                    >
                      {getEstimatedDate()}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "16px" }}>
                  <button
                    className="btn-secondary-chk"
                    onClick={() => setStep(3)}
                    disabled={loading}
                  >
                    Atrás
                  </button>
                  <button
                    className="btn-primary-chk"
                    onClick={handlePayNow}
                    disabled={loading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner" /> Procesando...
                      </>
                    ) : (
                      "Pagar ahora"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Sidebar */}
          <div
            style={{
              background: "#f8fafc",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              height: "fit-content",
            }}
          >
            <h3
              style={{
                color: "#1b4332",
                fontSize: "1.15rem",
                fontWeight: "800",
                marginBottom: "16px",
              }}
            >
              Resumen de Compra
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "20px",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                  color: "#4a5568",
                }}
              >
                <span>Subtotal:</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                  color: "#4a5568",
                }}
              >
                <span>Envío:</span>
                <span>{formatPrice(costoEnvio)}</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                fontSize: "1.1rem",
                color: "#1b4332",
              }}
            >
              <span>Total:</span>
              <span>{formatPrice(total + costoEnvio)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Styled Components for Checkout */}
      <style>{`
        .form-lbl {
          display: block;
          margin-bottom: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #4a5568;
        }
        .form-in {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          font-size: 0.95rem;
          color: #334155;
          transition: border-color 0.2s;
        }
        .form-in:focus {
          border-color: #2d6a4f;
        }
        .form-err {
          color: #e53e3e;
          font-size: 0.8rem;
          margin-top: 4px;
          display: block;
        }
        .btn-primary-chk {
          background: #2d6a4f;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 30px;
          font-weight: bold;
          cursor: pointer;
          min-width: 120px;
          box-shadow: 0 4px 12px rgba(45,106,79,0.2);
          transition: background-color 0.2s;
        }
        .btn-primary-chk:hover:not(:disabled) {
          background: #25553e;
        }
        .btn-primary-chk:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary-chk {
          background: white;
          color: #4a5568;
          border: 1px solid #cbd5e1;
          padding: 12px 24px;
          border-radius: 30px;
          font-weight: bold;
          cursor: pointer;
          min-width: 100px;
          transition: background-color 0.2s;
        }
        .btn-secondary-chk:hover:not(:disabled) {
          background: #f8fafc;
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
          .form-row {
            grid-template-columns: 1fr !important;
            gap: 16px;
          }
        }
      `}</style>
    </div>
    </BuyerShell>
  );
}


