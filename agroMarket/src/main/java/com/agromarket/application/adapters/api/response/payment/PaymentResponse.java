// application/adapters/api/response/payment/PaymentResponse.java
package com.agromarket.application.adapters.api.response.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.payment.PaymentMethod;
import com.agromarket.domain.models.enums.payment.PaymentState;
import com.agromarket.domain.ports.in.payment.PaymentResult;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long id;

    private Long orderId;

    private BigDecimal amount;

    private PaymentMethod paymentMethod;

    private PaymentState state;

    private String gatewayReference;

    private LocalDateTime paymentDate;

    private InvoiceResponse invoice;

    public static PaymentResponse fromResult(
            PaymentResult result) {

        if (result == null) {
            return null;
        }

        return PaymentResponse.builder()
                .id(result.getId())
                .orderId(result.getOrderId())
                .amount(result.getAmount())
                .paymentMethod(
                        result.getPaymentMethod())
                .state(result.getState())
                .gatewayReference(
                        result.getGatewayReference())
                .paymentDate(
                        result.getPaymentDate())
                .invoice(
                        InvoiceResponse.fromResult(
                                result.getInvoice()))
                .build();
    }
}