// domain/ports/in/shipping/ShippingResult.java
package com.agromarket.domain.ports.in.shipping;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.shipping.ShippingState;
import com.agromarket.domain.models.shipping.Shipping;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingResult {

    private Long id;

    private Long orderId;

    private String destinationAddress;

    private ShippingState state;

    private String carrier;

    private String trackingNumber;

    private LocalDate estimatedDeliveryDate;

    private String origin;

    private LocalDateTime createdAt;

    public static ShippingResult fromDomain(
            Shipping shipping) {

        if (shipping == null) {
            return null;
        }

        return ShippingResult.builder()
                .id(shipping.getId())
                .orderId(
                        shipping.getOrder() != null
                                ? shipping.getOrder().getId()
                                : null)
                .destinationAddress(
                        shipping.getDestinationAddress())
                .state(shipping.getState())
                .carrier(shipping.getCarrier())
                .trackingNumber(shipping.getTrackingNumber())
                .estimatedDeliveryDate(
                        shipping.getEstimatedDeliveryDate())
                .origin(shipping.getOrigin())
                .createdAt(shipping.getCreatedAt())
                .build();
    }
}