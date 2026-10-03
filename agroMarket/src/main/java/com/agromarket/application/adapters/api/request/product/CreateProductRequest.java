package com.agromarket.application.adapters.api.request.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.agromarket.domain.models.enums.product.FruitType;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String description;
    @NotNull
    @Positive
    private BigDecimal price;
    @NotNull
    @PositiveOrZero
    private Integer availableQuantity;
    private String imageUrl;
    @PositiveOrZero
    private Integer minimumWholesaleQuantity;
    @Positive
    private BigDecimal wholesalePrice;
    @NotNull
    private FruitType fruitType;
    private Long producerId;
    private boolean onPromotion;
    @Positive
    private BigDecimal promotionPrice;
    private LocalDateTime promotionEndDate;
}