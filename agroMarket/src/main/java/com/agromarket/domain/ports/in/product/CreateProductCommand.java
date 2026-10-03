package com.agromarket.domain.ports.in.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.agromarket.domain.models.enums.product.FruitType;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductCommand {
    private String name;
    private String description;
    private BigDecimal price;
    private Integer availableQuantity;
    private String imageUrl;
    private Integer minimumWholesaleQuantity;
    private BigDecimal wholesalePrice;
    private FruitType fruitType;
    private Long producerId;
    private boolean onPromotion;
    private BigDecimal promotionPrice;
    private LocalDateTime promotionEndDate;
}