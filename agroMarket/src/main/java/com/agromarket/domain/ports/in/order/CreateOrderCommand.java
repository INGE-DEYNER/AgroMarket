package com.agromarket.domain.ports.in.order;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateOrderCommand {
    private Long buyerId;
    private Long productId;
    private Integer quantity;
    /**
     * Id de la sesión de checkout. Todos los pedidos de un mismo carrito
     * comparten el mismo checkoutId. El backend lo usa para cobrar el envío
     * una única vez por compra (sólo el primer pedido del checkout lo lleva).
     */
    private String checkoutId;
    /**
     * Costo de envío (COP) en caso de que el cliente lo envíe. El backend
     * lo valida contra el valor configurado y lo fuerza a 0 si NO es el
     * primer pedido del checkout, por lo que el cliente nunca es la fuente
     * de verdad del total.
     */
    private BigDecimal shippingCost;
}
