package com.agromarket.application.adapters.persistence.sql.entities.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;

import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.domain.models.enums.order.OrderState;
import com.agromarket.domain.models.order.Order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "orders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "buyer_id", nullable = false)
    private UserEntity buyer;

    @JoinColumn(name = "product_id", nullable = false)
    private Long productId;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderState state;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    /**
     * Un checkout (un carrito) puede generar varios pedidos, todos con el
     * mismo checkoutId. Antes era unique = true, lo que impedía esa agrupación.
     */
    @Column(nullable = true)
    private String checkoutId;

    @Column(nullable = true, precision = 19, scale = 4)
    private BigDecimal shippingCost;

    public Order toDomain(com.agromarket.domain.models.product.Product product) {
        return Order.builder()
                .id(id)
                .buyer(buyer == null ? null : buyer.toDomain())
                .product(product)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .total(total)
                .shippingCost(shippingCost)
                .state(state)
                .createdAt(createdAt)
                .checkoutId(checkoutId)
                .build();
    }

    public static OrderEntity fromDomain(Order o, UserEntity buyer, Long productId) {
        return OrderEntity.builder().id(o.getId()).buyer(buyer).productId(productId)
                .quantity(o.getQuantity()).unitPrice(o.getUnitPrice()).total(o.getTotal())
                .shippingCost(o.getShippingCost())
                .state(o.getState()).createdAt(o.getCreatedAt()).checkoutId(o.getCheckoutId()).build();
    }
}