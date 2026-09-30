package com.agromarket.domain.services.shipping;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Tarifas de envío por categoría de trayecto.
 *
 * <p>ANTES: un único precio por kilómetro ({@code price-per-kilometer}), igual
 * para cualquier destino. Con la tarifa de $1.000/km, 199 km hasta Medellín
 * salían $199.393, veinte veces lo que espera pagar un comprador por un envío
 * de un par de kilos. Ese modelo no es el de las transportadoras: Envía,
 * Interrapidísimo y Mercado Envíos no cobran por distancia lineal, cobran por
 * peso facturable dentro de una banda de trayecto.
 *
 * <p>AHORA: cuatro categorías, cada una con su base por kilo y su mínimo. El
 * mínimo es lo que hace que un envío pequeno a Medellín cueste lo que Deyner
 * espera en vez de lo que saldria de multiplicar.
 *
 * <p>La categoría se decide por suposición, no por distancia lineal: dos
 * ciudades pueden estar a 30 km y caer en bandas distintas si una es rural.
 *
 * <p>Valores validados por Deyner. Se pueden ajustar por entorno sin tocar el
 * codigo (ver application.yml, bloque {@code app.shipping}).
 */
public final class ShippingTariffs {

    /**
     * Local / urbano: la entrega es en la misma ciudad que el centro de acopio.
     */
    public static final BigDecimal LOCAL_PER_KG = new BigDecimal("800");
    public static final BigDecimal LOCAL_MIN = new BigDecimal("3500");

    /**
     * Regional: mismo departamento, distinto municipio.
     */
    public static final BigDecimal REGIONAL_PER_KG = new BigDecimal("1400");
    public static final BigDecimal REGIONAL_MIN = new BigDecimal("6000");

    /**
     * Nacional: entre departamentos distintos.
     */
    public static final BigDecimal NACIONAL_PER_KG = new BigDecimal("2200");
    public static final BigDecimal NACIONAL_MIN = new BigDecimal("9500");

    /**
     * Especial: zonas de difícil acceso. Se activa con el interruptor de
     * {@code app.shipping.special-zone}, no automáticamente: decidir que una
     * zona es "especial" es un dato de negocio, no una regla del sistema.
     */
    public static final BigDecimal SPECIAL_PER_KG = new BigDecimal("3200");
    public static final BigDecimal SPECIAL_MIN = new BigDecimal("14000");

    private ShippingTariffs() {
    }

    /**
     * Calcula el costo de un envío.
     *
     * @param categoria    banda del trayecto
     * @param pesoFacturable kg a cobrar (real o volumétrico, el mayor)
     * @return el costo, nunca menor que el mínimo de la banda
     */
    public static BigDecimal costo(
            Categoria categoria,
            double pesoFacturable,
            BigDecimal overridePorKg,
            BigDecimal overrideMinimo) {

        BigDecimal porKg = overridePorKg != null ? overridePorKg : categoria.basePorKg();
        BigDecimal minimo = overrideMinimo != null ? overrideMinimo : categoria.minimo();

        // El peso minimo facturable es 1 kg: por debajo, la transportadora
        // redondea igual, y sin este max() un pedido de 0.2 kg costaria casi
        // nada y se perderia el costo real del despacho.
        double pesoCobrable = Math.max(1.0, pesoFacturable);

        BigDecimal total = porKg.multiply(BigDecimal.valueOf(pesoCobrable));
        return total.max(minimo).setScale(0, RoundingMode.CEILING);
    }

    /**
     * Bandas de trayecto. El nombre es corto porque acaba en la respuesta de
     * la API y en la interfaz.
     */
    public enum Categoria {
        LOCAL("Local", LOCAL_PER_KG, LOCAL_MIN),
        REGIONAL("Regional", REGIONAL_PER_KG, REGIONAL_MIN),
        NACIONAL("Nacional", NACIONAL_PER_KG, NACIONAL_MIN),
        ESPECIAL("Especial", SPECIAL_PER_KG, SPECIAL_MIN);

        private final String etiqueta;
        private final BigDecimal basePorKg;
        private final BigDecimal minimo;

        Categoria(String etiqueta, BigDecimal basePorKg, BigDecimal minimo) {
            this.etiqueta = etiqueta;
            this.basePorKg = basePorKg;
            this.minimo = minimo;
        }

        public String etiqueta() {
            return etiqueta;
        }

        public BigDecimal basePorKg() {
            return basePorKg;
        }

        public BigDecimal minimo() {
            return minimo;
        }
    }
}
