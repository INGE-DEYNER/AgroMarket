package com.agromarket.application.dto.response.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.product.enums.FruitType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta que representa un producto en el catálogo.
 * Contiene toda la información del producto para ser devuelta al cliente.
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer availableQuantity;
    private Integer stock;
    private String imageUrl;
    private FruitType fruitType;
    private Long producerId;
    private String producerName;
    private boolean onPromotion;
    private boolean active;
    private LocalDateTime createdAt;
    private Integer minimumWholesaleQuantity;
    private BigDecimal wholesalePrice;
    private double averageRating;
    private long totalReviews;
    private boolean producerVerified;
    private Integer totalSold;
    private BigDecimal promotionPrice;
    private LocalDateTime promotionEndDate;
    private Integer minWholesaleQuantity;
    private String category;
}
