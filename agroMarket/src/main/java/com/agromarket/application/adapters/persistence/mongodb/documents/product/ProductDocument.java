package com.agromarket.application.adapters.persistence.mongodb.documents.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import com.agromarket.domain.models.enums.product.FruitType;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.models.user.User;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
public class ProductDocument {
    @Id
    private String id;
    @Indexed
    private FruitType fruitType;
    @Indexed
    private Long producerId;
    private String producerName;
    private String producerCompanyName;
    @Indexed
    private boolean active;
    @Indexed
    private boolean onPromotion;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer availableQuantity;
    private String imageUrl;
    private Integer minimumWholesaleQuantity;
    private BigDecimal wholesalePrice;
    private BigDecimal promotionPrice;
    private LocalDateTime promotionEndDate;
    private Integer totalSold;
    private LocalDateTime createdAt;
    private Long version;

    private Long parseIdSafe(String idStr) {
        if (idStr == null) return null;
        try {
            return Long.valueOf(idStr);
        } catch (NumberFormatException e) {
            // Fallback for corrupted MongoDB ObjectIds created before the fix
            return (long) idStr.hashCode();
        }
    }

    public Product toDomain() {
        User u = User.builder().id(producerId).firstName(producerName).companyName(producerCompanyName).build();
        return Product.builder().id(parseIdSafe(id)).name(name).description(description)
                .price(price).availableQuantity(availableQuantity).imageUrl(imageUrl)
                .minimumWholesaleQuantity(minimumWholesaleQuantity).wholesalePrice(wholesalePrice).fruitType(fruitType)
                .producer(u).onPromotion(onPromotion).promotionPrice(promotionPrice).promotionEndDate(promotionEndDate)
                .totalSold(totalSold).active(active).createdAt(createdAt).version(version).build();
    }

    public static ProductDocument fromDomain(Product p) {
        User u = p.getProducer();
        return ProductDocument.builder().id(p.getId() == null ? null : String.valueOf(p.getId())).name(p.getName())
                .description(p.getDescription()).price(p.getPrice()).availableQuantity(p.getAvailableQuantity())
                .imageUrl(p.getImageUrl()).minimumWholesaleQuantity(p.getMinimumWholesaleQuantity())
                .wholesalePrice(p.getWholesalePrice()).fruitType(p.getFruitType())
                .producerId(u == null ? null : u.getId())
                .producerName(u == null ? null
                        : (u.getFirstName() + " " + (u.getLastName() == null ? "" : u.getLastName())).trim())
                .producerCompanyName(u == null ? null : u.getCompanyName()).onPromotion(p.isOnPromotion())
                .promotionPrice(p.getPromotionPrice()).promotionEndDate(p.getPromotionEndDate())
                .totalSold(p.getTotalSold()).active(p.isActive()).createdAt(p.getCreatedAt()).version(p.getVersion())
                .build();
    }
}