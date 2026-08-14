package com.agromarket.domain.models.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.models.enums.payment.PaymentMethod;
import com.agromarket.domain.models.enums.payment.PaymentState;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad de dominio que representa un pago en el sistema AgroMarket.
 * Contiene información sobre el monto, método de pago y estado de la transacción.
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
}
