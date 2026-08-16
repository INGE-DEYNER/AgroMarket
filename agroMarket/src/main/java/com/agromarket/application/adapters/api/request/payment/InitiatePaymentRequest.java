// application/adapters/api/request/payment/InitiatePaymentRequest.java
package com.agromarket.application.adapters.api.request.payment;

import com.agromarket.domain.models.enums.payment.PaymentMethod;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InitiatePaymentRequest {

    @NotNull
    @Positive
    private Long orderId;

    @NotNull
    @Positive
    private Long buyerId;

    @NotNull
    private PaymentMethod paymentMethod;
}