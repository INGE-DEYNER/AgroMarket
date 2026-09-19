package com.agromarket.application.adapters.api.response.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.agromarket.domain.models.enums.product.FruitType;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer availableQuantity;
    private String imageUrl;
    private Integer minimumWholesaleQuantity;
    private BigDecimal wholesalePrice;
    private FruitType fruitType;
    private boolean onPromotion;
    private BigDecimal promotionPrice;
    private LocalDateTime promotionEndDate;
    private Integer totalSold;
    private boolean active;
    private LocalDateTime createdAt;
    private Long version;
    private double averageRating;
    private long totalReviews;
    private ProducerSummaryResponse producer;
}