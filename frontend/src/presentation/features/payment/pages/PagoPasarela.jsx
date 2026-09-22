/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTheme } from "@/app/contexts/ThemeContext.js";
import api from "@/infrastructure/http/api";
import { useCart } from "@/presentation/features/order/hooks/useCart";
import { usePriceDisplay } from "@/app/hooks/usePriceDisplay";

/**
 * PagoPasarela - Integración con MercadoPago Checkout Pro
 * 
 * Funcionalidad:
 * - Inicializa MercadoPago SDK con Public Key
 * - Crea Checkout con preference_id generado por backend
 * - Maneja callbacks de MercadoPago
 * - Muestra estados de pago
 * 
 * Flujo:
 * 1. Backend crea pago y devuelve preference_id
 * 2. Frontend recibe preference_id por URL
 * 3. MercadoPago abre popup de checkout
 * 4. Usuario paga
 * 5. MercadoPago redirige a callback con status
 * 6. Frontend confirma pago en backend
 * 
 * Origen: REQ-08 (Pago en línea) + Documentación MercadoPago
 */
export default function PagoPasarela() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { darkMode } = useTheme();
  const { formatPrice } = usePriceDisplay();

  // Formatear monto en divisa activa (precio base en COP)
  const formatAmount = (amt) => formatPrice(amt);

  // Parámetros de URL (callback de MercadoPago)
  const preferenceId = searchParams.get("preference_id");
  const collectionStatus = searchParams.get("collection_status");
  const collectionId = searchParams.get("collection_id");

  // Estados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  const confirmPayment = useCallback(async (reference) => {
    try {
      // El cliente "api" devuelve el body parseado directamente (no axios).
      const res = await api.get(
        `/pagos?gatewayReference=${encodeURIComponent(reference)}`,
      );
      const list = Array.isArray(res) ? res : res?.content || [];
      const payment = list?.[0];
      if (payment?.id) {
        // Confirmación REAL: el backend consulta el pago en MercadoPago
        // (GET /v1/payments/{id}) y solo confirma si está aprobado.
        const confirmed = await api.patch(`/pagos/${payment.id}/confirm`);
        const result = confirmed?.data || confirmed;
        setPaymentDetails({
          id: result?.id ?? payment.id,
          amount: result?.amount ?? payment.amount,
          paymentDate: result?.paymentDate ?? payment.paymentDate,
          state: result?.state ?? payment.state,
        });
        if (result?.state === "CONFIRMED" || result?.state === "APPROVED") {
          setPaymentStatus("APROBADO");
        } else if (result?.state === "REJECTED") {
          setPaymentStatus("RECHAZADO");
        }
        clearCart();
      }
    } catch (err) {
      console.error("Error confirmando pago:", err);
      setError(err.message);
    }
  }, [clearCart]);

  const handleMercadoPagoCallback = useCallback(async () => {
    setLoading(true);
    try {
      const statusLower = (collectionStatus || "").toLowerCase();

      // Si MercadoPago reporta rechazo/cancelación, mostrarlo directo.
      if (statusLower === "rejected" || statusLower === "cancelled") {
        setPaymentStatus(
          statusLower === "rejected" ? "RECHAZADO" : "CANCELADO",
        );
        return;
      }

      // Para "approved" (o cualquier otro), verificar contra el backend.
      // La referencia que guardó el pago local es el preference_id.
      const reference = preferenceId || collectionId;
      if (reference) {
        await confirmPayment(reference);
      }

      // Si tras confirmar no quedó en un estado conocido, marcar pendiente.
      setPaymentStatus((prev) => prev || "PENDIENTE");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [collectionStatus, collectionId, preferenceId, confirmPayment]);

  const initializeCheckout = useCallback(async () => {
    if (!preferenceId) {
      navigate("/dashboard-comprador");
      return;
    }

    try {
      setLoading(true);

      // Buscar el pago local por la referencia (preference_id).
      const res = await api.get(
        `/pagos?gatewayReference=${encodeURIComponent(preferenceId)}`,
      );
      const list = Array.isArray(res) ? res : res?.content || [];
      const payment = list?.[0];

      if (!payment?.id) {
        throw new Error("No se encontro el pago asociado a esta orden.");
      }

      // Iniciar el pago real en MercadoPago: el backend devuelve la URL
      // del checkout (init_point) a la que hay que redirigir al usuario.
      const initRes = await api.post(`/pagos/iniciar`, {
        orderId: payment.orderId,
        paymentMethod: "MERCADO_PAGO",
      });
      const init = initRes?.data || initRes;

      if (init?.checkoutUrl) {
        // Redirigir a la pasarela REAL de MercadoPago.
        window.location.href = init.checkoutUrl;
        return;
      }

      throw new Error(
        "MercadoPago no genero un enlace de pago valido. Verifica las credenciales.",
      );
    } catch (err) {
      console.error("Error inicializando checkout:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [preferenceId, navigate]);

  useEffect(() => {
    if (collectionStatus || collectionId) {
      void handleMercadoPagoCallback();
    }
    else if (preferenceId) {
      void initializeCheckout();
    }
    else { setError("No hay información de pago válida"); setLoading(false); }
  }, [preferenceId, collectionStatus, collectionId, handleMercadoPagoCallback, initializeCheckout]);

  // Formateadores
  const formatDate = (d) => d ? new Date(d).toLocaleString("es-CO") : "-";

  // ===== RENDERIZADO =====

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Procesando...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md mx-4 text-center">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Error de Pago</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
        <button onClick={() => navigate("/dashboard-comprador")} className="btn-primary w-full">
          Volver al Dashboard
        </button>
      </div>
    </div>
  );

  // Pago exitoso
  if (paymentStatus === "APROBADO") return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-green-600 dark:text-green-400 text-3xl">✓</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">¡Pago Exitoso!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Tu pago ha sido procesado por MercadoPago.
        </p>
        
        <div className="space-y-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
          {paymentDetails?.gatewayReference && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Referencia:</span>
              <span className="font-medium">{paymentDetails.gatewayReference}</span>
            </div>
          )}
          {paymentDetails?.amount && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Monto:</span>
              <span className="font-bold text-green-600">{formatAmount(paymentDetails.amount)}</span>
            </div>
          )}
          {paymentDetails?.paymentDate && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="font-medium">{formatDate(paymentDetails.paymentDate)}</span>
            </div>
          )}
        </div>
        
        <button onClick={() => navigate("/dashboard-comprador?success=1")} className="btn-primary w-full">
          Ver Mis Pedidos
        </button>
      </div>
    </div>
  );

  // Pago pendiente
  if (paymentStatus === "PENDIENTE") return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-yellow-600 dark:text-yellow-400 text-3xl">⏳</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Pago en Proceso</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Tu pago está siendo procesado.
        </p>
        <button onClick={() => navigate("/dashboard-comprador")} className="btn-secondary w-full">
          Volver al Dashboard
        </button>
      </div>
    </div>
  );

  // Pago rechazado/cancelado
  if (paymentStatus === "RECHAZADO" || paymentStatus === "CANCELADO") return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-red-600 dark:text-red-400 text-3xl">✗</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Pago No Completado</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {paymentStatus === "RECHAZADO" ? "El pago fue rechazado" : "El pago fue cancelado"}
        </p>
        <div className="space-y-3">
          <button onClick={() => navigate("/dashboard-comprador")} className="btn-secondary w-full">
            Ver Pedidos
          </button>
          <button onClick={() => navigate("/checkout")} className="btn-primary w-full">
            Intentar Nuevamente
          </button>
        </div>
      </div>
    </div>
  );

  // Checkout (inicial)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl max-w-lg w-full text-center">
        <img src="/agromarket/logo.png" alt="ASAFRUT" className="w-16 h-16 mx-auto mb-4 rounded-lg" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Completar Pago</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Serás redirigido a MercadoPago
        </p>
        <div id="mp-checkout"></div>
        {loading && <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando...</p>}
      </div>
    </div>
  );
}
