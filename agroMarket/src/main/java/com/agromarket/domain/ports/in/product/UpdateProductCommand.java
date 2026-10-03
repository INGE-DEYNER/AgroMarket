package com.agromarket.domain.ports.in.product;
import java.math.BigDecimal; import java.time.LocalDateTime;
import com.agromarket.domain.models.enums.product.FruitType;
import lombok.*;
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class UpdateProductCommand {
 private String name; private String description; private BigDecimal price; private String imageUrl;
 private Integer minimumWholesaleQuantity; private BigDecimal wholesalePrice; private FruitType fruitType;
 private boolean onPromotion; private BigDecimal promotionPrice; private LocalDateTime promotionEndDate;
}