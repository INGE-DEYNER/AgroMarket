package com.agromarket.application.dto.response.shipping;

import java.time.LocalDate;

import com.agromarket.domain.shipping.enums.ShippingState;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de salida que representa un envío.
 * Contiene la información del envío para ser devuelta al cliente.
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingResponse {
    private Long id;
    private Long orderId;
    private String origin;
    private String destinationAddress;
    private ShippingState status;
    private String carrier;
    private String trackingNumber;
    private LocalDate estimatedDeliveryDate;
}
