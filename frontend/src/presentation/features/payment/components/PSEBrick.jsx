import { useState, useEffect, useRef } from "react";
import { useMercadoPago } from "@/infrastructure/payment/useMercadoPago";
import api from "@/infrastructure/http/api";

/**
 * Componente PSEBrick - Integración con PSE (Pagos Seguros en Línea) de MercadoPago
 *
 * Este componente permite el pago usando PSE (transferencia electrónica) usando MercadoPago.
 *
 * Props:
 * - amount: Monto del pago (requerido)
 * - orderId: ID del pedido (requerido)
 * - onPaymentSuccess: Callback cuando el pago es exitoso
 * - onPaymentError: Callback cuando hay un error
 * - onPaymentCancel: Callback cuando se cancela
 */
export default function PSEBrick({ amount, orderId, onPaymentError }) {
  const { mp, loading: mpLoading, error: mpError } = useMercadoPago();
  const brickContainerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);

  // Obtener lista de bancos disponibles para PSE
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
        if (!publicKey) return;

        // Usar el SDK para obtener métodos de pago
        if (typeof globalThis.MercadoPago !== "undefined") {
          const mpInstance = new globalThis.MercadoPago(publicKey, {
            locale: "es-CO",
          });

          // Obtener métodos de pago
          const paymentMethods = await mpInstance.getPaymentMethods({
            bin: null,
            amount: amount,
          });

          // Filtrar bancos que soportan PSE
          const pseBanks = paymentMethods.filter(
            (method) =>
              method.payment_type_id === "bank_transfer" &&
              method.id.includes("pse"),
          );

          setBanks(pseBanks);
        }
      } catch (err) {
        console.error("Error al obtener bancos PSE:", err);
        // Bancos PSE más comunes en Colombia (fallback)
        setBanks([
          {
            id: "pse",
            name: "PSE - Pagos Seguros en Línea",
            financialInstitution: "Todos los bancos",
          },
          {
            id: "pse_bancolombia",
            name: "Bancolombia",
            financialInstitution: "Bancolombia",
          },
          {
            id: "pse_davivienda",
            name: "Davivienda",
            financialInstitution: "Davivienda",
          },
          {
            id: "pse_banco_de_bogota",
            name: "Banco de Bogotá",
            financialInstitution: "Banco de Bogotá",
          },
          {
            id: "pse_banco_occidente",
            name: "Banco Occidente",
            financialInstitution: "Banco Occidente",
          },
          {
            id: "pse_banco_popular",
            name: "Banco Popular",
            financialInstitution: "Banco Popular",
          },
        ]);
      }
    };

    if (amount > 0) {
      fetchPaymentMethods();
    }
  }, [amount]);

  // Inicializar el pago PSE cuando tengamos el banco seleccionado
  useEffect(() => {
    if (!selectedBank || amount <= 0 || !orderId) return;

    const processPSEPayment = async () => {
      try {
        setLoading(true);

        // Crear una preferencia en el backend usando el endpoint específico de MercadoPago
        const successUrl = `${window.location.origin}/pago/exitoso?preference_id={preference_id}&method=pse`;
        const failureUrl = `${window.location.origin}/pago/fallido?method=pse`;
        const pendingUrl = `${window.location.origin}/pago/pendiente?method=pse`;

        const response = await api.post("/mercadopago/preferences", {
          externalReference: `AGROMARKET-ORDER-${orderId}`,
          amount: amount,
          description: `Pago PSE - Pedido #${orderId}`,
          paymentMethod: "PSE",
          payerEmail: "cliente@ejemplo.com", // Debería venir del contexto del usuario
          payerName: "Cliente AgroMarket", // Debería venir del contexto del usuario
          payerIdentification: null, // Debería venir del contexto del usuario
          successUrl: successUrl,
          failureUrl: failureUrl,
          pendingUrl: pendingUrl,
        });

        const { preference } = response;

        if (!preference) {
          throw new Error("No se pudo crear la preferencia de pago");
        }

        // Para PSE, usamos el Checkout Pro que redirige al banco
        // el Brick de Card Payment no soporta PSE directamente
        if (mp) {
          mp.checkout({
            preference: preference,
            render: { container: "#pse-checkout-container" },
            autoOpen: true,
          });
        } else {
          // Fallback: redirigir directamente a MercadoPago
          window.location.href = `https://www.mercadopago.com.co/checkout/v1/redirect?preference_id=${preference.id}`;
        }

        setLoading(false);
      } catch (err) {
        console.error("Error al procesar PSE:", err);
        setError(err.message || "Error al procesar el pago PSE");
        setLoading(false);
        if (onPaymentError) onPaymentError(err);
      }
    };

    processPSEPayment();

    return () => {
      // Limpiar
    };
  }, [selectedBank, amount, orderId, mp, onPaymentError]);

  if (mpLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Cargando MercadoPago...
          </p>
        </div>
      </div>
    );
  }

  if (mpError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
        <p className="text-red-600 dark:text-red-400">{mpError}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 text-red-600 dark:text-red-400 hover:underline"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  // Mostrar selector de bancos PSE
  return (
    <div className="w-full space-y-4" data-payment-theme="adaptive">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        PSE - Pagos Seguros en Línea
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-300">
        Selecciona tu banco para realizar el pago mediante transferencia
        electrónica:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
        {banks.map((bank) => (
          <button
            key={bank.id}
            onClick={() => setSelectedBank(bank)}
            className={`p-4 border rounded-lg hover:shadow-md transition-all text-left ${
              selectedBank?.id === bank.id
                ? "border-primary bg-primary/5"
                : "border-gray-200 dark:border-gray-700 hover:border-primary"
            }`}
          >
            <div className="flex items-center space-x-3">
              {bank.financialInstitution && (
                <img
                  src={`/payments/${bank.id}.png`}
                  alt={bank.name}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {bank.name}
                </p>
                {bank.financialInstitution && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {bank.financialInstitution}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedBank && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-blue-700 dark:text-blue-300">
            Banco seleccionado:{" "}
            <span className="font-semibold">{selectedBank.name}</span>
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            Serás redirigido a la página de pago de{" "}
            {selectedBank.financialInstitution || selectedBank.name}
          </p>
        </div>
      )}

      <div
        id="pse-checkout-container"
        ref={brickContainerRef}
        className="w-full"
      ></div>

      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin h-6 w-6 border-3 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
}
