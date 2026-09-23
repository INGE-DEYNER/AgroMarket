package com.agromarket.application.adapters.api.request.payment;

import com.agromarket.domain.models.enums.payment.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InitiatePaymentRequest {

    private Long orderId;
    private Long pedidoId;

    private Long buyerId;
    private Long compradorId;

    private PaymentMethod paymentMethod;
    private String metodoPago;

    public Long getOrderId() {
        if (orderId != null) return orderId;
        return pedidoId;
    }

    public Long getBuyerId() {
        if (buyerId != null) return buyerId;
        return compradorId;
    }

    public PaymentMethod getPaymentMethod() {
        if (paymentMethod != null) return paymentMethod;
        if (metodoPago != null) {
            try {
                return PaymentMethod.valueOf(metodoPago.toUpperCase());
            } catch (Exception e) {
                if ("TARJETA".equalsIgnoreCase(metodoPago)) return PaymentMethod.CREDIT_CARD;
                return PaymentMethod.MERCADO_PAGO;
            }
        }
        return PaymentMethod.MERCADO_PAGO;
    }
}