package com.agromarket.application.adapters.persistence.sql.entities.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.domain.models.enums.product.FruitType;
import com.agromarket.domain.models.product.Product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "products",
    indexes = {
        @Index(name = "idx_products_producer", columnList = "producer_id"),
        @Index(name = "idx_products_fruit_type", columnList = "fruit_type"),
        @Index(name = "idx_products_active", columnList = "active")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer availableQuantity;

    @Column(length = 1000)
    private String imageUrl;

    @Column(nullable = false)
    private Integer minimumWholesaleQuantity;

    @Column(precision = 19, scale = 4)
    private BigDecimal wholesalePrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "fruit_type", nullable = false, length = 50)
    private FruitType fruitType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producer_id", nullable = false)
    private UserEntity producer;

    @Column(nullable = false)
    private boolean onPromotion;

    @Column(precision = 19, scale = 4)
    private BigDecimal promotionPrice;

    private LocalDateTime promotionEndDate;

    @Column(nullable = false)
    private Integer totalSold;

    @Column(nullable = false)
    private boolean active;

    /*
     * FIX "Column 'created_at' cannot be null" (falso 401 "Token inválido o
     * expirado" al guardar producto): el dominio llega sin createdAt al crear,
     * el INSERT salía con NULL y MySQL (SQLState 23000) rechazaba la fila.
     * Se sigue la convención del proyecto (ReturnRequestEntity,
     * CreditCardEntity): valor por defecto + @PrePersist de respaldo.
     */
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    @Version
    private Long version;

    public Product toDomain() {
        return Product.builder()
                .id(id)
                .name(name)
                .description(description)
                .price(price)
                .availableQuantity(availableQuantity)
                .imageUrl(imageUrl)
                .minimumWholesaleQuantity(minimumWholesaleQuantity)
                .wholesalePrice(wholesalePrice)
                .fruitType(fruitType)
                .producer(producer == null ? null : producer.toDomain())
                .onPromotion(onPromotion)
                .promotionPrice(promotionPrice)
                .promotionEndDate(promotionEndDate)
                .totalSold(totalSold)
                .active(active)
                .createdAt(createdAt)
                .version(version)
                .build();
    }

    public static ProductEntity fromDomain(
            Product product,
            UserEntity producer) {

        return ProductEntity.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .availableQuantity(product.getAvailableQuantity())
                .imageUrl(product.getImageUrl())
                .minimumWholesaleQuantity(product.getMinimumWholesaleQuantity())
                .wholesalePrice(product.getWholesalePrice())
                .fruitType(product.getFruitType())
                .producer(producer)
                .onPromotion(product.isOnPromotion())
                .promotionPrice(product.getPromotionPrice())
                .promotionEndDate(product.getPromotionEndDate())
                .totalSold(product.getTotalSold())
                .active(product.isActive())
                .createdAt(product.getCreatedAt())
                .version(product.getVersion())
                .build();
    }
}
