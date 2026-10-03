// application/adapters/api/request/payment/ConfirmPaymentRequest.java
package com.agromarket.application.adapters.api.request.payment;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Body para POST /api/v1/pagos/confirmar, donde el frontend manda el ID del
 * pago en el body en lugar de en la URL (a diferencia de
 * PATCH /api/v1/payments/{id}/confirm, que sí lo espera en la URL).
 */
public record ConfirmPaymentRequest(
        @NotNull @Positive Long paymentId) {
}
