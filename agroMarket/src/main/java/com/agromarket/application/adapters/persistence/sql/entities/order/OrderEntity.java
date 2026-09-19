package com.agromarket.application.adapters.persistence.sql.entities.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import com.agromarket.application.adapters.persistence.sql.entities.product.ProductEntity;
import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.models.order.OrderItem;
import com.agromarket.domain.models.enums.order.OrderState;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "orders",
    indexes = {
        @Index(name = "idx_orders_buyer", columnList = "buyer_id"),
        @Index(name = "idx_orders_state", columnList = "state"),
        @Index(name = "idx_orders_checkout", columnList = "checkout_id")
    }
)
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

    @OneToMany(
        mappedBy = "order",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<OrderItemEntity> items = new ArrayList<>();

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal total;

    @Column(precision = 19, scale = 4)
    private BigDecimal shippingCost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OrderState state;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(length = 100)
    private String checkoutId;

    public Order toDomain() {

        List<OrderItem> domainItems = items == null
                ? new ArrayList<>()
                : items.stream()
                    .map(item -> OrderItem.builder()
                        .id(item.getId())
                        .product(
                            item.getProduct() == null
                                ? null
                                : item.getProduct().toDomain()
                        )
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build()
                    )
                    .collect(Collectors.toList());

        return Order.builder()
                .id(id)
                .buyer(buyer == null ? null : buyer.toDomain())
                .items(domainItems)
                .total(total)
                .shippingCost(shippingCost)
                .state(state)
                .createdAt(createdAt)
                .checkoutId(checkoutId)
                .build();
    }

    public static OrderEntity fromDomain(
            Order order,
            UserEntity buyer,
            List<OrderItemEntity> itemEntities) {

        OrderEntity entity = OrderEntity.builder()
                .id(order.getId())
                .buyer(buyer)
                .total(order.getTotal())
                .shippingCost(order.getShippingCost())
                .state(order.getState())
                .createdAt(order.getCreatedAt())
                .checkoutId(order.getCheckoutId())
                .build();

        if (itemEntities != null) {
            itemEntities.forEach(item -> item.setOrder(entity));
            entity.setItems(itemEntities);
        }

        return entity;
    }
}
