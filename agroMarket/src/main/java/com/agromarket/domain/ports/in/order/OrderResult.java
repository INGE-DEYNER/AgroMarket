package com.agromarket.domain.ports.in.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.agromarket.domain.models.enums.order.OrderState;
import com.agromarket.domain.models.order.OrderItem;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.models.user.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResult {

    private Long id;

    private User buyer;

    /**
     * Todos los ítems del pedido (uno o varios productos).
     */
    private List<OrderItem> items;

    /**
     * Primer ítem del pedido, expuesto por compatibilidad con los clientes
     * que todavía consumen un único producto por pedido. Para pedidos con
     * varios ítems usa {@link #items}.
     */
    private Product product;

    /**
     * Cantidad del primer ítem (compatibilidad; ver {@link #items}).
     */
    private Integer quantity;

    /**
     * Precio unitario del primer ítem (compatibilidad; ver {@link #items}).
     */
    private BigDecimal unitPrice;

    private BigDecimal total;

    private BigDecimal shippingCost;

    private OrderState state;

    private LocalDateTime createdAt;

    private String checkoutId;
}