import { useDivisa } from "@/app/hooks/useDivisa";

/**
 * Conjunto de símbolos por código de divisa.
 * No es la fuente de verdad del formato (eso lo hace formatearPrecio),
 * pero ayuda a desplegar un símbolo rápido en contextos muy específicos.
 */
export const SIMBOLO_DIVISA = {
  COP: "$",
  USD: "US$",
  EUR: "€",
  GBP: "£",
  BRL: "R$",
  MXN: "MX$",
  CLP: "CLP$",
  JPY: "¥",
  CNY: "¥",
  PEN: "S/",
  ARS: "AR$",
  CAD: "CA$",
};

/**
 * Hook centralizado para mostrar precios.
 *
 * Todas las pantallas del proyecto (home, catálogo, detalle, carrito,
 * checkout, pedidos, pasarela de pago, etc.) deben formatear los precios
 * a través de este hook y no directamente con Intl.NumberFormat ni con
 * lógica suelta, de modo que al cambiar la divisa todos los precios se
 * actualizan en tiempo real en toda la plataforma.
 */
export function usePriceDisplay() {
  const { formatearPrecio, convertir, divisaActual } = useDivisa();

  /**
   * Convierte un monto expresado en COP a la divisa activa del cliente.
   * El producto siempre se guarda/opera en COP, pero aquí devolvemos el
   * valor equivalente en la moneda que el usuario eligió.
   */
  const convertFromCop = (copAmount) => {
    if (copAmount == null || copAmount === "") {
      return 0;
    }
    const num = Number(copAmount);
    if (!Number.isFinite(num)) {
      return 0;
    }
    return convertir(num);
  };

  /**
   * Formatea un precio en COP a la divisa y locale actuales.
   * Ejemplo de salida:
   *  - COP -> $ 4.500
   *  - USD -> US$ 3,75
   *  - EUR -> € 4,11
   */
  const formatPrice = (copAmount) => {
    if (copAmount == null || copAmount === "") {
      const simbolo = SIMBOLO_DIVISA[divisaActual] || "$";
      return `${simbolo} 0`;
    }
    const num = Number(copAmount);
    if (!Number.isFinite(num)) {
      const simbolo = SIMBOLO_DIVISA[divisaActual] || "$";
      return `${simbolo} 0`;
    }
    // formatearPrecio ya aplica conversión COP -> divisa activa + locale del idioma.
    return formatearPrecio(num);
  };

  /**
   * Monto listo para enviar a backend/pasarela, expresado en la divisa activa.
   * En pagos podemos necesitar el valor numérico convertido (no formateado).
   */
  const amountForPayment = (copAmount) => convertFromCop(copAmount);

  return {
    divisaActual,
    formatPrice,
    convertFromCop,
    amountForPayment,
  };
}
