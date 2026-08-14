package com.agromarket.application.dto.request.shipping;

import java.time.LocalDate;

import com.agromarket.domain.shipping.enums.ShippingState;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de entrada para actualizar un envío.
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateShippingRequest {
    @Size(max = 100, message = "El transportista no puede exceder 100 caracteres")
    private String carrier;
    
    @Size(max = 100, message = "El número de guía no puede exceder 100 caracteres")
    private String trackingNumber;
    
    private LocalDate estimatedDeliveryDate;
    
    private ShippingState status;
}
