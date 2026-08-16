package com.agromarket.application.adapters.persistence.sql.entities.shipping;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.agromarket.application.adapters.persistence.sql.entities.order.OrderEntity;
import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.models.shipping.Shipping;
import com.agromarket.domain.models.enums.shipping.ShippingState;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "shipping")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingEntity {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "order_id", nullable = false)
        private OrderEntity order;

        private Long buyerId;

        private Long producerId;

        private String destinationAddress;

        private ShippingState state;

        private String carrier;

        private String trackingNumber;

        private LocalDate estimatedDeliveryDate;

        private String origin;

        private LocalDateTime createdAt;

        public Shipping toDomain() {
                return Shipping.builder()
                                .id(id)
                                .order(order == null
                                                ? null
                                                : Order.builder().id(order.getId()).build())
                                .destinationAddress(destinationAddress)
                                .state(state)
                                .carrier(carrier)
                                .trackingNumber(trackingNumber)
                                .estimatedDeliveryDate(estimatedDeliveryDate)
                                .origin(origin)
                                .createdAt(createdAt)
                                .build();
        }

        public static ShippingEntity fromDomain(
                        Shipping shipping,
                        OrderEntity order) {

                Long buyerId = shipping.getOrder() != null
                                && shipping.getOrder().getBuyer() != null
                                                ? shipping.getOrder().getBuyer().getId()
                                                : null;

                Long producerId = shipping.getOrder() != null
                                && shipping.getOrder().getProduct() != null
                                && shipping.getOrder().getProduct().getProducer() != null
                                                ? shipping.getOrder().getProduct().getProducer().getId()
                                                : null;

                return ShippingEntity.builder()
                                .id(shipping.getId())
                                .order(order)
                                .buyerId(buyerId)
                                .producerId(producerId)
                                .destinationAddress(shipping.getDestinationAddress())
                                .state(shipping.getState())
                                .carrier(shipping.getCarrier())
                                .trackingNumber(shipping.getTrackingNumber())
                                .estimatedDeliveryDate(shipping.getEstimatedDeliveryDate())
                                .origin(shipping.getOrigin())
                                .createdAt(shipping.getCreatedAt())
                                .build();
        }
}
