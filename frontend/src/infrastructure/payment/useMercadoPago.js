/**
 * Hook personalizado para inicializar MercadoPago SDK
 * 
 * Uso:
 * const { mp, loading, error } = useMercadoPago();
 */
import { useState, useEffect } from 'react';

export function useMercadoPago() {
  const [mp, setMp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initialize = () => {
      try {
        const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
        
        if (!publicKey) {
          throw new Error('Public Key de MercadoPago no configurada');
        }

        if (typeof MercadoPago === 'undefined') {
          throw new Error('SDK de MercadoPago no cargado');
        }

        // Inicializar MercadoPago
        const mpInstance = new MercadoPago(publicKey, {
          locale: 'es-CO',
        });

        setMp(mpInstance);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    initialize();
  }, []);

  return { mp, loading, error };
}
