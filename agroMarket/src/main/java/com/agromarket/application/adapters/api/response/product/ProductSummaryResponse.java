package com.agromarket.application.adapters.api.response.product;

import java.math.BigDecimal;
import com.agromarket.domain.models.enums.product.FruitType;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSummaryResponse {
    private Long id;
    private String name;
    private BigDecimal price;
    private Integer availableQuantity;
    private String imageUrl;
    private FruitType fruitType;
    private boolean onPromotion;
    private BigDecimal promotionPrice;
    private double averageRating;
    private long totalReviews;
    private ProducerSummaryResponse producer;
}