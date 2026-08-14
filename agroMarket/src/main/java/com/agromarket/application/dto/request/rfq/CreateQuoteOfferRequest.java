package com.agromarket.application.dto.request.rfq;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * DTO de entrada para crear una oferta para una solicitud de cotización.
 * 
 * @author AgroMarket Team
 */
public record CreateQuoteOfferRequest(
    @NotNull(message = "El precio propuesto es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio propuesto debe ser mayor que 0")
    BigDecimal proposedPrice,
    
    @Size(max = 2000, message = "Los comentarios no pueden exceder 2000 caracteres")
    String comments
) {
}
