package com.agromarket.application.dto.response.rfq;

import com.agromarket.application.dto.response.user.UserResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO de salida que representa una oferta para una solicitud de cotización.
 * 
 * @author AgroMarket Team
 */
public record QuoteOfferResponse(
    Long id,
    RequestForQuoteResponse requestForQuote,
    UserResponse producer,
    BigDecimal proposedPrice,
    String comments,
    boolean accepted,
    LocalDateTime createdAt
) {
}
