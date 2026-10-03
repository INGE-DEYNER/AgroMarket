package com.agromarket.application.adapters.persistence.sql.entities.review;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import com.agromarket.application.adapters.persistence.sql.entities.product.ProductEntity;
import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.domain.models.review.Review;

import lombok.*;

/**
 * Entidad JPA de reseñas.
 *
 * <p>
 * Los nombres de tabla y columna siguen la migración Flyway
 * {@code V4__create_cart_favorites_reviews.sql} (products.product_id,
 * reviews.user_id, reviews.created_at) y los nombres de los atributos siguen
 * al modelo de dominio {@link Review} (buyer/product/rating/comment/date),
 * que antes no coincidían ({@code reviewer}/{@code createdAt}).
 * </p>
 */
@Entity
@Table(
    name = "reviews",
    indexes = {
        @Index(name = "idx_reviews_product", columnList = "product_id"),
        @Index(name = "idx_reviews_user", columnList = "user_id")
    },
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_reviews_product_buyer",
            columnNames = {"product_id", "user_id"}
        )
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    /**
     * Comprador que creó la reseña (columna {@code user_id}).
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity buyer;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 2000)
    private String comment;

    /**
     * Fecha y hora de creación de la reseña (columna {@code created_at}).
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime date;

    public Review toDomain() {
        return Review.builder()
                .id(id)
                .product(product == null ? null : product.toDomain())
                .buyer(buyer == null ? null : buyer.toDomain())
                .rating(rating)
                .comment(comment)
                .date(date)
                .build();
    }

    public static ReviewEntity fromDomain(
            Review review,
            UserEntity buyer,
            ProductEntity product) {

        return ReviewEntity.builder()
                .id(review.getId())
                .product(product)
                .buyer(buyer)
                .rating(review.getRating())
                .comment(review.getComment())
                .date(review.getDate())
                .build();
    }
}