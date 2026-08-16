package com.agromarket.application.adapters.persistence.sql.entities.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.agromarket.application.adapters.persistence.sql.entities.product.ProductEntity;
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
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;
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
    @Column(unique = true)
    private String checkoutId;

    public Order toDomain() {
        return Order.builder().id(id)
                .buyer(buyer == null ? null : buyer.toDomain())
                .product(product == null ? null : product.toDomain())
                .quantity(quantity).unitPrice(unitPrice).total(total).state(state)
                .createdAt(createdAt).checkoutId(checkoutId).build();
    }

    public static OrderEntity fromDomain(Order o, UserEntity buyer, ProductEntity product) {
        return OrderEntity.builder().id(o.getId()).buyer(buyer).product(product)
                .quantity(o.getQuantity()).unitPrice(o.getUnitPrice()).total(o.getTotal())
                .state(o.getState()).createdAt(o.getCreatedAt()).checkoutId(o.getCheckoutId()).build();
    }
}
