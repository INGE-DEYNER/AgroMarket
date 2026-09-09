package com.agromarket.domain.services.order;

import java.math.BigDecimal;

import com.agromarket.domain.exceptions.order.InvalidOrderStateException;
import com.agromarket.domain.models.enums.order.OrderState;
import com.agromarket.domain.models.order.Order;

/**
 * Servicio de dominio para reglas del ciclo de vida del pedido.
 */
public class OrderService {

    /**
     * Calcula el total del pedido: subtotal (precio unitario * cantidad)
     * más el costo de envío cuando corresponde (el primer pedido de un
     * checkout).
     */
    public BigDecimal calculateTotal(Order order) {

        if (order == null
                || order.getQuantity() == null
                || order.getUnitPrice() == null) {

            throw new IllegalArgumentException(
                    "La cantidad y el precio unitario son obligatorios"
            );
        }

        if (order.getQuantity() <= 0) {
            throw new IllegalArgumentException(
                    "La cantidad debe ser mayor que cero"
            );
        }

        if (order.getUnitPrice().signum() < 0) {
            throw new IllegalArgumentException(
                    "El precio unitario no puede ser negativo"
            );
        }

        BigDecimal subtotal = order.getUnitPrice()
                .multiply(
                        BigDecimal.valueOf(
                                order.getQuantity()
                        )
                );

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

        return order.getState() == OrderState.PENDING
                ? OrderState.SHIPPED
                : OrderState.DELIVERED;
    }
}