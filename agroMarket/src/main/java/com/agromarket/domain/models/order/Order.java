package com.agromarket.domain.models.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.agromarket.domain.exceptions.order.InvalidOrderStateException;
import com.agromarket.domain.models.enums.order.OrderState;
import com.agromarket.domain.models.payment.Invoice;
import com.agromarket.domain.models.payment.Payment;
import com.agromarket.domain.models.shipping.Shipping;
import com.agromarket.domain.models.user.User;

import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    private Long id;

    /**
     * Usuario que realizÃ³ el pedido.
     */
    private User buyer;

    /**
     * Productos incluidos en el pedido.
     */
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    /**
     * Total de los productos mÃ¡s el costo de envÃ­o.
     */
    private BigDecimal total;

    /**
     * Costo de envÃ­o.
     */
    private BigDecimal shippingCost;

    /**
     * Estado actual del pedido.
     */
    private OrderState state;

    /**
     * Fecha y hora de creaciÃ³n.
     */
    private LocalDateTime createdAt;

    /**
     * ID de la sesiÃ³n de checkout.
     */
    private String checkoutId;

    private Payment payment;

    private Invoice invoice;

    private Shipping shipping;

    public void advanceState() {

        if (state == OrderState.PENDING) {
            state = OrderState.ACCEPTED;
            return;
        }

        if (state == OrderState.ACCEPTED) {
            state = OrderState.SHIPPED;
            return;
        }

        if (state == OrderState.SHIPPED) {
            state = OrderState.DELIVERED;
            return;
        }

        throw new InvalidOrderStateException(
                "El pedido no puede avanzar desde el estado actual");
    }

    public void cancel() {

        if (state != OrderState.PENDING) {
            throw new InvalidOrderStateException(
                    "Solo se puede cancelar un pedido pendiente");
        }

        state = OrderState.CANCELLED;
    }

    /**
     * Calcula el subtotal de todos los productos.
     */
    public BigDecimal calculateSubtotal() {

        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return items.stream()
                .map(OrderItem::calculateSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calcula el total incluyendo el envÃ­o.
     */
    public BigDecimal calculateTotal() {

        BigDecimal subtotal = calculateSubtotal();

        BigDecimal shipping = shippingCost == null
                ? BigDecimal.ZERO
                : shippingCost;

        return subtotal.add(shipping);
    }

    /**
     * Recalcula y actualiza el total del pedido.
     */
    public void recalculateTotal() {
        this.total = calculateTotal();
    }

    /**
     * Agrega un producto al pedido.
     */
    public void addItem(OrderItem item) {

        if (item == null) {
            return;
        }

        if (items == null) {
            items = new ArrayList<>();
        }

        items.add(item);
        recalculateTotal();
    }
}

