// application/adapters/api/response/shipping/ShippingResponse.java
package com.agromarket.application.adapters.api.response.shipping;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.shipping.ShippingState;
import com.agromarket.domain.ports.in.shipping.ShippingResult;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingResponse {

    private Long id;

    private Long orderId;

    private String destinationAddress;

    private ShippingState state;

    private String carrier;

    private String trackingNumber;

    private LocalDate estimatedDeliveryDate;

    private String origin;

    private LocalDateTime createdAt;

    public static ShippingResponse fromResult(
            ShippingResult result) {

        if (result == null) {
            return null;
        }

        return ShippingResponse.builder()
                .id(result.getId())
                .orderId(result.getOrderId())
                .destinationAddress(
                        result.getDestinationAddress())
                .state(result.getState())
                .carrier(result.getCarrier())
                .trackingNumber(
                        result.getTrackingNumber())
                .estimatedDeliveryDate(
                        result.getEstimatedDeliveryDate())
                .origin(result.getOrigin())
                .createdAt(result.getCreatedAt())
                .build();
    }
}