package com.agromarket.application.adapters.persistence.mongodb.documents.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.agromarket.domain.models.enums.payment.PaymentMethod;
import com.agromarket.domain.models.enums.payment.PaymentState;
import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.models.payment.Payment;

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
@Document(collection = "payments")
public class PaymentDocument {

    @Id
    private String id;

    @Indexed
    private Long orderId;

    private BigDecimal amount;

    private PaymentMethod paymentMethod;

    private PaymentState state;

    private String gatewayReference;

    private LocalDateTime paymentDate;

    public Payment toDomain() {
        return Payment.builder()
                .id(parseId(id))
                .order(orderReference(orderId))
                .amount(amount)
                .paymentMethod(paymentMethod)
                .state(state)
                .gatewayReference(gatewayReference)
                .paymentDate(paymentDate)
                .build();
    }

    public static PaymentDocument fromDomain(Payment payment) {
        Long orderId = payment.getOrder() != null
                ? payment.getOrder().getId()
                : null;

        return PaymentDocument.builder()
                .id(payment.getId() != null
                        ? payment.getId().toString()
                        : null)
                .orderId(orderId)
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .state(payment.getState())
                .gatewayReference(payment.getGatewayReference())
                .paymentDate(payment.getPaymentDate())
                .build();
    }

    private static Order orderReference(Long orderId) {
        return orderId == null
                ? null
                : Order.builder().id(orderId).build();
    }

    private static Long parseId(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
