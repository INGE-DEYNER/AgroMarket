package com.agromarket.application.adapters.persistence.sql.entities.shipping;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

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
import com.agromarket.domain.models.order.OrderItem;
import com.agromarket.domain.models.shipping.Shipping;
import com.agromarket.domain.models.enums.shipping.ShippingState;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidad JPA de envíos.
 *
 * <p>
 * Un pedido puede contener varios ítems ({@code order_items}) de distintos
 * productores, por lo que el productor del envío ya no se puede leer de un
 * único producto del pedido: se resuelve a partir de los ítems (ver
 * {@link #resolveProducerId(Order)}).
 * </p>
 */
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

        /**
         * Comprador del pedido (denormalizado para consultas).
         */
        private Long buyerId;

        /**
         * Productor responsable del envío. Es nulo cuando el pedido mezcla
         * ítems de varios productores (no hay uno solo al que atribuir el
         * envío). Ver {@link #resolveProducerId(Order)}.
         */
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

                if (shipping == null) {
                        return null;
                }

                Order domainOrder = shipping.getOrder();

                Long buyerId = domainOrder != null
                                && domainOrder.getBuyer() != null
                                                ? domainOrder.getBuyer().getId()
                                                : null;

                return ShippingEntity.builder()
                                .id(shipping.getId())
                                .order(order)
                                .buyerId(buyerId)
                                .producerId(resolveProducerId(domainOrder))
                                .destinationAddress(shipping.getDestinationAddress())
                                .state(shipping.getState())
                                .carrier(shipping.getCarrier())
                                .trackingNumber(shipping.getTrackingNumber())
                                .estimatedDeliveryDate(shipping.getEstimatedDeliveryDate())
                                .origin(shipping.getOrigin())
                                .createdAt(shipping.getCreatedAt())
                                .build();
        }

        /**
         * Resuelve el productor del envío a partir de los ítems del pedido.
         *
         * @param order pedido de dominio (puede tener 0..N ítems)
         * @return el id del productor cuando todos los ítems provienen del
         *         mismo productor; {@code null} si no hay ítems o si el pedido
         *         mezcla varios productores
         */
        public static Long resolveProducerId(Order order) {

                if (order == null
                                || order.getItems() == null
                                || order.getItems().isEmpty()) {
                        return null;
                }

                Set<Long> producerIds = new LinkedHashSet<>();

                for (OrderItem item : order.getItems()) {

                        if (item == null
                                        || item.getProduct() == null
                                        || item.getProduct().getProducer() == null) {
                                continue;
                        }

                        Long producerId = item.getProduct().getProducer().getId();

                        if (producerId != null) {
                                producerIds.add(producerId);
                        }
                }

                return producerIds.size() == 1
                                ? producerIds.iterator().next()
                                : null;
        }
}