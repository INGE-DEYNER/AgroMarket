package com.agromarket.domain.services.order;

import java.math.BigDecimal;

import com.agromarket.domain.exceptions.order.InvalidOrderStateException;
import com.agromarket.domain.models.enums.order.OrderState;
import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.models.order.OrderItem;

/**
 * Servicio de dominio para reglas del ciclo de vida del pedido.
 */
public class OrderService {

    /**
     * Calcula el total del pedido: la suma de los subtotales de sus ítems
     * (precio unitario * cantidad) más el costo de envío cuando corresponde
     * (el primer pedido de un checkout).
     *
     * @param order pedido con al menos un {@link OrderItem}
     * @return total del pedido
     */
    public BigDecimal calculateTotal(Order order) {

        if (order == null) {
            throw new IllegalArgumentException(
                    "El pedido es obligatorio"
            );
        }

        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new IllegalArgumentException(
                    "El pedido debe tener al menos un producto"
            );
        }

        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItem item : order.getItems()) {
            subtotal = subtotal.add(validarItem(item));
        }

        BigDecimal envio = order.getShippingCost() == null
                ? BigDecimal.ZERO
                : order.getShippingCost();

        if (envio.signum() < 0) {
            throw new IllegalArgumentException(
                    "El costo de envío no puede ser negativo"
            );
        }

        return subtotal.add(envio);
    }

    /**
     * Valida un ítem del pedido y devuelve su subtotal.
     */
    private BigDecimal validarItem(OrderItem item) {

        if (item == null) {
            throw new IllegalArgumentException(
                    "El pedido no puede contener ítems nulos"
            );
        }

        if (item.getProduct() == null) {
            throw new IllegalArgumentException(
                    "Cada ítem del pedido debe tener un producto"
            );
        }

        if (item.getQuantity() == null || item.getUnitPrice() == null) {
            throw new IllegalArgumentException(
                    "La cantidad y el precio unitario son obligatorios en cada ítem"
            );
        }

        if (item.getQuantity() <= 0) {
            throw new IllegalArgumentException(
                    "La cantidad debe ser mayor que cero"
            );
        }

        if (item.getUnitPrice().signum() < 0) {
            throw new IllegalArgumentException(
                    "El precio unitario no puede ser negativo"
            );
        }

        return item.calculateSubtotal();
    }

    /**
     * Verifica si un pedido puede cancelarse.
     */
    public boolean canCancel(Order order) {

        return order != null
                && order.getState() == OrderState.PENDING;
    }

    /**
     * Verifica si el estado puede avanzar.
     */
    public boolean canAdvance(Order order) {

        if (order == null || order.getState() == null) {
            return false;
        }

        return order.getState() == OrderState.PENDING
                || order.getState() == OrderState.ACCEPTED
                || order.getState() == OrderState.SHIPPED;
    }

    /**
     * Obtiene el siguiente estado válido.
     */
    public OrderState nextState(Order order) {

        if (!canAdvance(order)) {
            throw new InvalidOrderStateException(
                    "El pedido no puede avanzar desde su estado actual"
            );
        }

        return switch (order.getState()) {
            case PENDING -> OrderState.ACCEPTED;
            case ACCEPTED -> OrderState.SHIPPED;
            case SHIPPED -> OrderState.DELIVERED;
            default -> throw new InvalidOrderStateException("Estado no válido para avanzar");
        };
    }
}