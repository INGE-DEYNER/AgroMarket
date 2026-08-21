import { useState, useEffect, useRef } from 'react';
import { useMercadoPago } from '@/infrastructure/payment/useMercadoPago';
import { useTheme } from '@/app/contexts/ThemeContext';

/**
 * Componente TarjetaPagoBrick - Integración con Card Payment Brick de MercadoPago
 * 
 * Este componente permite el pago con tarjetas de crédito/débito usando el Brick de MercadoPago.
 * 
 * Props:
 * - amount: Monto del pago (requerido)
 * - orderId: ID del pedido (requerido)
 * - onPaymentSuccess: Callback cuando el pago es exitoso
 * - onPaymentError: Callback cuando hay un error
 * - onPaymentCancel: Callback cuando se cancela
 */
export default function TarjetaPagoBrick({
  amount,
  orderId,
  onPaymentSuccess,
  onPaymentError,
  onPaymentCancel,
}) {
  const { darkMode } = useTheme();
  const { mp, loading: mpLoading, error: mpError } = useMercadoPago();
  const brickContainerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mp || !brickContainerRef.current) return;

    const renderCardBrick = async () => {
      try {
        setLoading(true);

        // Primero crear la preferencia en el backend
        const successUrl = `${window.location.origin}/pago/exitoso?preference_id={preference_id}&method=card`;
        const failureUrl = `${window.location.origin}/pago/fallido?method=card`;
        const pendingUrl = `${window.location.origin}/pago/pendiente?method=card`;

        const response = await api.post('/mercadopago/preferences', {
          externalReference: `AGROMARKET-ORDER-${orderId}`,
          amount: amount,
          description: `Pago con tarjeta - Pedido #${orderId}`,
          paymentMethod: 'CREDIT_CARD',
          payerEmail: 'cliente@ejemplo.com', // Debería venir del contexto del usuario
          payerName: 'Cliente AgroMarket', // Debería venir del contexto del usuario
          payerIdentification: null, // Debería venir del contexto del usuario
          successUrl: successUrl,
          failureUrl: failureUrl,
          pendingUrl: pendingUrl,
        });

        const { preference } = response.data;

        if (!preference) {
          throw new Error('No se pudo crear la preferencia de pago');
        }

        // Configurar el Brick con la preferencia
        await mp.bricks().create("cardPayment", "cardPaymentBrick_container", {
          initialization: {
            amount: amount,
            preferenceId: preference.external_reference || preference.id,
          },
          customization: {
            paymentMethods: {
              creditCard: "all",
              debitCard: "all",
            },
            visual: {
              theme: darkMode ? "dark" : "light",
              textColor: darkMode ? "#FFFFFF" : "#333333",
              backgroundColor: darkMode ? "#1a1a1a" : "#FFFFFF",
            },
          },
          callbacks: {
            onReady: () => {
              console.log("Card Brick listo");
              setLoading(false);
            },
            onSubmit: (formData) => {
              // Form data contains the card data
              console.log("Form data:", formData);
              // Verificar que los datos sean válidos
              if (formData && formData.token) {
                // Pago exitoso
                if (onPaymentSuccess) onPaymentSuccess(formData.token);
                return new Promise((resolve) => resolve());
              } else {
                // Error en los datos
                if (onPaymentError) onPaymentError(new Error("Datos de tarjeta inválidos"));
                return new Promise((_, reject) => reject(new Error("Datos inválidos")));
              }
            },
            onError: (error) => {
              console.error("Error en Card Brick:", error);
              setError(error.message || "Error al procesar el pago");
              setLoading(false);
              if (onPaymentError) onPaymentError(error);
            },
          },
        });
      } catch (err) {
        console.error("Error al renderizar Card Brick:", err);
        setError(err.message || "Error al cargar el componente de pago");
        setLoading(false);
      }
    };

    renderCardBrick();

    return () => {
      // Limpiar el Brick al desmontar
      if (mp?.bricks) {
        mp.bricks().remove("cardPayment");
      }
    };
  }, [mp, amount, orderId, darkMode, onPaymentSuccess, onPaymentError]);

  if (mpLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando MercadoPago...</p>
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

  return (
    <div className="w-full">
      <div
        id="cardPaymentBrick_container"
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
