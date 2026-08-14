package com.agromarket.domain.models.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.order.OrderState;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.models.payment.Payment;
import com.agromarket.domain.models.payment.Invoice;
import com.agromarket.domain.models.shipping.Shipping;
import com.agromarket.domain.exceptions.order.InvalidOrderStateException;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad de dominio que representa un pedido en el sistema AgroMarket.
 * Contiene información sobre el comprador, el producto, la cantidad y el estado del pedido.
 * 
 * @author AgroMarket Team
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    
    private Long id;
    
    /**
     * Usuario que realizó el pedido (debe ser un comprador).
     */
    private User buyer;
    
    /**
     * Producto que se está pediendo.
     */
    private Product product;
    
    /**
     * Cantidad de unidades del producto solicitadas.
     */
    private Integer quantity;
    
    /**
     * Precio unitario del producto al momento de realizar el pedido.
     */
    private BigDecimal unitPrice;
    
    /**
     * Total calculado del pedido (precio unitario * cantidad).
     */
    private BigDecimal total;
    
    /**
     * Estado actual del pedido.
     */
    private OrderState state;
    
    /**
     * Fecha y hora en que se creó el pedido.
     */
    private LocalDateTime createdAt;
    
    /**
     * ID de la sesión de checkout asociada al pedido.
     */
    private String checkoutId;
    
    /**
     * Pago asociado al pedido.
     */
    private Payment payment;
    
    /**
     * Factura generada para el pedido.
     */
    private Invoice invoice;
    
    /**
     * Información de envío asociada al pedido.
     */
    private Shipping shipping;
    
    
    // ==================== MÉTODOS DE NEGOCIO ====================
    
    /**
     * Avanza el estado del pedido según su estado actual.
     * Transiciones válidas:
     * - PENDING → SHIPPED
     * - SHIPPED → DELIVERED
     * 
     * @throws InvalidOrderStateException si el pedido no puede avanzar desde su estado actual
     */
    public void advanceState() {
        if (state == OrderState.PENDING) {
            state = OrderState.SHIPPED;
            return;
        }
        if (state == OrderState.SHIPPED) {
            state = OrderState.DELIVERED;
            return;
        }
        throw new InvalidOrderStateException("El pedido no puede avanzar desde el estado actual");
    }
    
    /**
     * Cancela el pedido si está en estado PENDING.
     * 
     * @throws InvalidOrderStateException si el pedido no está en estado PENDING
     */
    public void cancel() {
        if (state != OrderState.PENDING) {
            throw new InvalidOrderStateException("Solo se puede cancelar un pedido pendiente");
        }
        state = OrderState.CANCELLED;
    }
    
    /**
     * Calcula el total del pedido basado en la cantidad y el precio unitario.
     * 
     * @return total del pedido (precio unitario * cantidad)
     */
    public BigDecimal calculateTotal() {
        if (quantity == null || unitPrice == null) {
            return BigDecimal.ZERO;
        }
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}
