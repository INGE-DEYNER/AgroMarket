// application/adapters/api/response/payment/PaymentInitiationResponse.java
package com.agromarket.application.adapters.api.response.payment;

import com.agromarket.domain.models.payment.PaymentInitiationResult;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitiationResponse {

    private String checkoutUrl;

    private String reference;

    /**
     * ID del pago local creado (útil para que el frontend pueda confirmar o
     * consultar el estado sin depender de la referencia de la pasarela).
     */
    private Long paymentId;

    public static PaymentInitiationResponse fromDomainResult(
            PaymentInitiationResult result) {

        return PaymentInitiationResponse.builder()
                .checkoutUrl(result.getCheckoutUrl())
                .reference(result.getReference())
                .paymentId(result.getPaymentId())
                .build();
    }
}