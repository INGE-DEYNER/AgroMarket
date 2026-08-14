package com.agromarket.application.dto.request.rfq;

import com.agromarket.domain.product.enums.FruitType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO de entrada para crear una nueva solicitud de cotización (Request for Quote).
 * 
 * @author AgroMarket Team
 */
public record CreateRequestForQuoteRequest(
    @NotNull(message = "El tipo de fruta es obligatorio")
    FruitType fruitType,
    
    @NotNull(message = "La cantidad requerida es obligatoria")
    @DecimalMin(value = "0.01", message = "La cantidad requerida debe ser mayor que 0")
    Double requiredQuantity,
    
    @Size(max = 2000, message = "La descripción no puede exceder 2000 caracteres")
    String description,
    
    @NotNull(message = "La fecha límite es obligatoria")
    @Future(message = "La fecha límite debe ser en el futuro")
    LocalDateTime deadline
) {
}
