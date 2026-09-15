package com.agromarket.domain.services.payment;


import java.math.BigDecimal;

import com.agromarket.domain.exceptions.payment.InvalidPaymentStateException;
import com.agromarket.domain.models.enums.payment.PaymentState;
import com.agromarket.domain.models.payment.Payment;

/**
 * Servicio de dominio para reglas de pagos.
 */
public class PaymentService {

    /**
     * Verifica si un pago puede confirmarse.
     */
    public boolean canConfirm(Payment payment) {

        return payment != null
                && payment.getState() == PaymentState.PENDING;
    }

    /**
     * Verifica si un pago puede rechazarse.
     */
    public boolean canReject(Payment payment) {

        return payment != null
                && (payment.getState() == PaymentState.PENDING
                    || payment.getState() == PaymentState.IN_PROCESS);
    }

    /**
     * Verifica que el monto sea válido.
     */
    public boolean hasValidAmount(Payment payment) {

        return payment != null
                && payment.getAmount() != null
                && payment.getAmount()
                        .compareTo(BigDecimal.ZERO) > 0;
    }

    /**
     * Valida una transición antes de confirmarla.
     */
    public void validateConfirmation(Payment payment) {

        if (!canConfirm(payment)) {
            throw new InvalidPaymentStateException(
                    "El pago no puede confirmarse desde su estado actual"
            );
        }

        if (!hasValidAmount(payment)) {
            throw new IllegalArgumentException(
                    "El monto del pago debe ser mayor que cero"
            );
        }
    }
}