package com.agromarket.application.adapters.api.request.rfq;

import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.product.FruitType;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateRequestForQuoteRequest(
                @NotNull FruitType fruitType,
                @NotNull @Positive Double requiredQuantity,
                String description,
                @NotNull @Future LocalDateTime deadline) {
}
