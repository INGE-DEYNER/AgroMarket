package com.agromarket.application.adapters.persistence.mongodb.documents.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import com.agromarket.domain.models.enums.order.OrderState;
import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.models.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class OrderDocument {
        @Id
        private String id;
        @Indexed
        private Long buyerId;
        @Indexed
        private Long producerId;
        private Long productId;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal total;
        @Indexed
        private OrderState state;
        private LocalDateTime createdAt;
        private String checkoutId;

        public Order toDomain() {
                User buyer = buyerId == null ? null : User.builder().id(buyerId).build();
                Product product = productId == null ? null
                                : Product.builder()
                                                .id(productId)
                                                .producer(producerId == null ? null
                                                                : User.builder().id(producerId).build())
                                                .build();
                return Order.builder().id(parseId(id)).buyer(buyer).product(product)
                                .quantity(quantity).unitPrice(unitPrice).total(total).state(state)
                                .createdAt(createdAt).checkoutId(checkoutId).build();
        }

        public static OrderDocument fromDomain(Order order) {
                Long buyer = order.getBuyer() == null ? null : order.getBuyer().getId();
                Long product = order.getProduct() == null ? null : order.getProduct().getId();
                Long producer = order.getProduct() == null || order.getProduct().getProducer() == null
                                ? null
                                : order.getProduct().getProducer().getId();
                return OrderDocument.builder().id(order.getId() == null ? null : order.getId().toString())
                                .buyerId(buyer).productId(product).producerId(producer)
                                .quantity(order.getQuantity()).unitPrice(order.getUnitPrice()).total(order.getTotal())
                                .state(order.getState()).createdAt(order.getCreatedAt())
                                .checkoutId(order.getCheckoutId()).build();
        }

        private static Long parseId(String value) {
                try {
                        return value == null ? null : Long.valueOf(value);
                } catch (NumberFormatException e) {
                        return null;
                }
        }
}
