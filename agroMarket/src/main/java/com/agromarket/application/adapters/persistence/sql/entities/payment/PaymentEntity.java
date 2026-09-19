package com.agromarket.application.adapters.persistence.sql.entities.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.agromarket.application.adapters.persistence.sql.entities.order.OrderEntity;
import com.agromarket.domain.models.enums.payment.PaymentMethod;
import com.agromarket.domain.models.enums.payment.PaymentState;
import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.models.payment.Payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "payments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEntity {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "order_id", nullable = false)
        private OrderEntity order;

        private BigDecimal amount;

        private PaymentMethod paymentMethod;

        private PaymentState state;

        private String gatewayReference;

        private LocalDateTime paymentDate;

        /** Fecha/hora de retención en fideicomiso. */
        private LocalDateTime escrowHeldAt;

        /** Fecha/hora de liberación al productor. */
        private LocalDateTime releasedAt;

        /** Fecha/hora del reembolso al comprador. */
        private LocalDateTime refundedAt;

        public Payment toDomain() {
                return Payment.builder()
                                .id(id)
                                .order(order == null
                                                ? null
                                                : Order.builder().id(order.getId()).build())
                                .amount(amount)
                                .paymentMethod(paymentMethod)
                                .state(state)
                                .gatewayReference(gatewayReference)
                                .paymentDate(paymentDate)
                                .escrowHeldAt(escrowHeldAt)
                                .releasedAt(releasedAt)
                                .refundedAt(refundedAt)
                                .build();
        }

        public static PaymentEntity fromDomain(
                        Payment payment,
                        OrderEntity order) {

                return PaymentEntity.builder()
                                .id(payment.getId())
                                .order(order)
                                .amount(payment.getAmount())
                                .paymentMethod(payment.getPaymentMethod())
                                .state(payment.getState())
                                .gatewayReference(payment.getGatewayReference())
                                .paymentDate(payment.getPaymentDate())
                                .escrowHeldAt(payment.getEscrowHeldAt())
                                .releasedAt(payment.getReleasedAt())
                                .refundedAt(payment.getRefundedAt())
                                .build();
        }
}
