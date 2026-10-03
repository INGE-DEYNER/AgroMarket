package com.agromarket.application.adapters.api.request.product;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStockRequest {
    @NotNull
    @PositiveOrZero
    private Integer availableQuantity;
}