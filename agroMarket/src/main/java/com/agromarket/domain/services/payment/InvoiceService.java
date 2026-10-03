package com.agromarket.domain.services.payment;


import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Servicio de dominio para cálculo de facturas.
 */
public class InvoiceService {

    private static final BigDecimal TAX_RATE =
            new BigDecimal("0.19");

    /**
     * Calcula el impuesto sobre un subtotal.
     */
    public BigDecimal calculateTax(BigDecimal subtotal) {

        validateAmount(subtotal);

        return subtotal
                .multiply(TAX_RATE)
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calcula el total incluyendo impuesto.
     */
    public BigDecimal calculateTotal(BigDecimal subtotal) {

        validateAmount(subtotal);

        BigDecimal tax = calculateTax(subtotal);

        return subtotal
                .add(tax)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private void validateAmount(BigDecimal amount) {

        if (amount == null
                || amount.compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException(
                    "El subtotal no puede ser negativo"
            );
        }
    }
}