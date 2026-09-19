package com.agromarket.domain.models.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.payment.PaymentMethod;
import com.agromarket.domain.models.enums.payment.PaymentState;
import com.agromarket.domain.models.order.Order;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad de dominio que representa un pago en el sistema AgroMarket.
 * Contiene información sobre el monto, método de pago y estado de la
 * transacción.
 *
 * @author AgroMarket Team
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    private Long id;

    /**
     * Pedido asociado a este pago.
     */
    private Order order;

    /**
     * Monto total del pago.
     */
    private BigDecimal amount;

    /**
     * Método de pago utilizado.
     */
    private PaymentMethod paymentMethod;

    /**
     * Estado actual del pago.
     */
    private PaymentState state;

    /**
     * Referencia o ID de la transacción en la pasarela de pago.
     */
    private String gatewayReference;

    /**
     * Fecha y hora en que se realizó el pago.
     */
    private LocalDateTime paymentDate;

    /**
     * Fecha/hora en que el dinero entró en fideicomiso (retenido).
     */
    private LocalDateTime escrowHeldAt;

    /**
     * Fecha/hora en que el dinero se liberó al productor.
     */
    private LocalDateTime releasedAt;

    /**
     * Fecha/hora en que el dinero se devolvió al comprador.
     */
    private LocalDateTime refundedAt;

    // ==================== MÉTODOS DE NEGOCIO ====================

    /**
     * Confirma el pago con una referencia de la pasarela.
     * Actualiza el estado a CONFIRMED y guarda la referencia.
     *
     * @param reference referencia de la pasarela de pago
     */
    public void confirm(String reference) {
        this.state = PaymentState.CONFIRMED;
        this.gatewayReference = reference;
        this.paymentDate = LocalDateTime.now();
    }

    /**
     * Rechaza/cancela el pago.
     * Actualiza el estado a REJECTED.
     */
    public void reject() {
        this.state = PaymentState.REJECTED;
    }

    /**
     * Retiene el dinero en fideicomiso.
     *
     * <p>
     * Transición válida: CONFIRMED → IN_ESCROW. Es idempotente: si el pago ya
     * está IN_ESCROW no cambia nada.
     * </p>
     */
    public void holdInEscrow() {

        if (state == PaymentState.IN_ESCROW) {
            return;
        }

        if (state != PaymentState.CONFIRMED) {
            throw new IllegalStateException(
                    "Solo un pago confirmado puede retenerse en fideicomiso. Estado actual: "
                            + state);
        }

        this.state = PaymentState.IN_ESCROW;

        if (this.escrowHeldAt == null) {
            this.escrowHeldAt = LocalDateTime.now();
        }
    }

    public void release() {
        if (state != PaymentState.IN_ESCROW && state != PaymentState.CONFIRMED) {
            throw new IllegalStateException("Solo un pago confirmado o en fideicomiso puede liberarse");
        }
        this.state = PaymentState.RELEASED;
        this.releasedAt = LocalDateTime.now();
    }

    public void refund() {
        if (state != PaymentState.CONFIRMED && state != PaymentState.IN_ESCROW) {
            throw new IllegalStateException("El pago no puede reembolsarse desde su estado actual");
        }
        this.state = PaymentState.REFUNDED;
        this.refundedAt = LocalDateTime.now();
    }
}