import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/infrastructure/http/api";
import TarjetaPagoBrick from "../components/TarjetaPagoBrick";
import PSEBrick from "../components/PSEBrick";
import { useCart } from "@/presentation/features/order/hooks/useCart";
import { usePriceDisplay } from "@/app/hooks/usePriceDisplay";

/**
 *SeleccionMetodoPago - Página para seleccionar método de pago (Tarjeta o PSE)
 *
 * Esta página permite al usuario elegir entre pagar con tarjeta de crédito/débito
 * o mediante PSE (Pagos Seguros en Línea).
 */
export default function SeleccionMetodoPago() {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const { formatPrice, divisaActual } = usePriceDisplay();

  // Obtener parámetros de la URL
  const orderId = searchParams.get("orderId");
  const amount = parseFloat(searchParams.get("amount") || "0");

  // Estados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  // Obtener información del pago desde el backend
  useEffect(() => {
    const fetchPaymentInfo = async () => {
      try {
        if (!orderId) {
          throw new Error("ID de pedido no proporcionado");
        }

        const order = await api.get(`/orders/${orderId}`);

        if (!order) {
          throw new Error("Pedido no encontrado");
        }

        setPaymentData({
          orderId: order.id,
          amount: order.totalAmount || amount,
          description: order.description || `Pago - Pedido #${order.id}`,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error al cargar información del pago:", err);
        setError(err.message || "Error al cargar la información del pago");
        setLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [orderId, amount]);

  // Manejar pago exitoso
  const handlePaymentSuccess = (reference) => {
    clearCart();
    navigate(`/pago/exitoso?reference=${reference}&orderId=${orderId}`);
  };

  // Manejar error de pago
  const handlePaymentError = (error) => {
    console.error("Error en el pago:", error);
    setError(error.message || "Error al procesar el pago");
  };

  // Manejar cancelación
  const handlePaymentCancel = () => {
    navigate("/dashboard-comprador?cancelled=1");
  };

  // Formatear monto usando divisa activa (precio base en COP, visualización en divisa del cliente)
  const formatAmount = (amt) => formatPrice(amt);

  // si está cargando
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Cargando información del pago...
          </p>
        </div>
      </div>
    );
  }

  // si hay error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md mx-4 text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Error
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/dashboard-comprador")}
              className="btn-secondary w-full"
            >
              Volver al Dashboard
            </button>
            <button
              onClick={() => navigate("/checkout")}
              className="btn-primary w-full"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay datos de pago
  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md mx-4 text-center">
          <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Información incompleta
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            No se pudo cargar la información del pago.
          </p>
          <button
            onClick={() => navigate("/dashboard-comprador")}
            className="btn-primary w-full"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Mostrar selección de método de pago o el componente correspondiente
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Seleccionar Método de Pago
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Pedido #${paymentData.orderId}
              </p>
            </div>
            <img
              src="/logo-asafrut.jpg"
              alt="ASAFRUT"
              className="w-16 h-16 rounded-lg object-cover"
            />
          </div>

          {/* Resumen del pago */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Resumen del Pago
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Monto a pagar:
                </span>
                <span className="font-bold text-lg text-primary">
                  {formatAmount(paymentData.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Descripción:
                </span>
                <span className="text-gray-800 dark:text-gray-200">
                  {paymentData.description}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Selección de método de pago */}
        {!selectedMethod && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">
              Elige tu método de pago
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tarjeta de crédito/débito */}
              <button
                onClick={() => setSelectedMethod("card")}
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary transition-all duration-300 p-6 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent group-hover:from-primary/10 transition-all"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">💳</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200">
                          Tarjeta
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Crédito o débito
                        </p>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        →
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <img
                      src="/payments/visa.png"
                      alt="Visa"
                      className="h-8 object-contain"
                    />
                    <img
                      src="/payments/mastercard.png"
                      alt="Mastercard"
                      className="h-8 object-contain"
                    />
                    <img
                      src="/payments/amex.png"
                      alt="American Express"
                      className="h-8 object-contain"
                    />
                    <span className="text-xs text-gray-400">+ más</span>
                  </div>
                </div>
              </button>

              {/* PSE */}
              <button
                onClick={() => setSelectedMethod("pse")}
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary transition-all duration-300 p-6 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent group-hover:from-blue-400/10 transition-all"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">🏛️</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200">
                          PSE
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Transferencia electrónica
                        </p>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        →
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <img
                      src="/payments/bancolombia.png"
                      alt="Bancolombia"
                      className="h-8 object-contain"
                    />
                    <img
                      src="/payments/davivienda.png"
                      alt="Davivienda"
                      className="h-8 object-contain"
                    />
                    <img
                      src="/payments/banco_bogota.png"
                      alt="Banco de Bogotá"
                      className="h-8 object-contain"
                    />
                    <span className="text-xs text-gray-400">+ más</span>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => navigate("/dashboard-comprador")}
                className="btn-secondary"
              >
                Volver al carrito
              </button>
            </div>
          </div>
        )}

        {/* Componente de Tarjeta */}
        {selectedMethod === "card" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedMethod(null)}
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-gray-600 dark:text-gray-300">←</span>
                </button>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  Pago con Tarjeta
                </h2>
              </div>
            </div>

            <TarjetaPagoBrick
              amount={paymentData.amount}
              orderId={paymentData.orderId}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onPaymentCancel={handlePaymentCancel}
            />
          </div>
        )}

        {/* Componente de PSE */}
        {selectedMethod === "pse" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedMethod(null)}
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-gray-600 dark:text-gray-300">←</span>
                </button>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  Pago con PSE
                </h2>
              </div>
            </div>

            <PSEBrick
              amount={paymentData.amount}
              orderId={paymentData.orderId}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onPaymentCancel={handlePaymentCancel}
            />
          </div>
        )}
      </div>
    </div>
  );
}
