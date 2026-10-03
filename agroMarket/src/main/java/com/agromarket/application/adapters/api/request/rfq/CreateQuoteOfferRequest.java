package com.agromarket.application.adapters.api.request.rfq;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateQuoteOfferRequest(
                @NotNull @Positive BigDecimal proposedPrice,
                String comments) {
}
