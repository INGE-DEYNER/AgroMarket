package com.agromarket.application.dto.response.rfq;

import com.agromarket.application.dto.response.user.UserResponse;
import com.agromarket.domain.product.enums.FruitType;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de salida que representa una solicitud de cotización (Request for Quote).
 * 
 * @author AgroMarket Team
 */
public record RequestForQuoteResponse(
    Long id,
    UserResponse buyer,
    FruitType fruitType,
    Double requiredQuantity,
    String description,
    LocalDateTime deadline,
    boolean active,
    LocalDateTime createdAt,
    List<QuoteOfferResponse> offers
) {
}
