package com.agromarket.infrastructure.persistence.sql.adapters;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.agromarket.domain.product.enums.FruitType;
import com.agromarket.domain.product.model.Product;
import com.agromarket.domain.product.model.Review;
import com.agromarket.domain.product.ports.out.ProductRepository;
import com.agromarket.infrastructure.persistence.sql.entities.ProductEntity;
import com.agromarket.infrastructure.persistence.sql.entities.ReviewEntity;
import com.agromarket.infrastructure.persistence.sql.entities.UserEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.ProductJpaRepository;
import com.agromarket.infrastructure.persistence.sql.repositories.ReviewJpaRepository;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

/**
 * Adaptador JPA para el repositorio de productos.
 * Implementa el puerto de salida ProductRepository usando JPA/Hibernate.
 * Mapea entre entidades de dominio y entidades JPA.
 * 
 * @author AgroMarket Team
 */
@Component
@RequiredArgsConstructor
public class ProductJpaAdapter implements ProductRepository {
    
    private final ProductJpaRepository productJpaRepository;
    private final ReviewJpaRepository reviewJpaRepository;

    /**
     * Convierte una entidad de dominio Product a ProductEntity.
     */
    private ProductEntity toEntity(Product product) {
        if (product == null) {
            return null;
        }
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
                .producer(product.getProducer() != null ? 
                    UserEntity.builder().id(product.getProducer().getId()).build() : null)
                .onPromotion(product.isOnPromotion())
                .promotionPrice(product.getPromotionPrice())
                .promotionEndDate(product.getPromotionEndDate())
                .totalSold(product.getTotalSold())
                .active(product.isActive())
                .createdAt(product.getCreatedAt())
                .version(product.getVersion())
                .build();
    }

    /**
     * Convierte una ProductEntity a entidad de dominio Product.
     */
    private Product toDomain(ProductEntity entity) {
        if (entity == null) {
            return null;
        }
        return Product.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .availableQuantity(entity.getAvailableQuantity())
                .imageUrl(entity.getImageUrl())
                .minimumWholesaleQuantity(entity.getMinimumWholesaleQuantity())
                .wholesalePrice(entity.getWholesalePrice())
                .fruitType(entity.getFruitType())
                .producer(entity.getProducer() != null ? 
                    com.agromarket.domain.user.model.User.builder()
                        .id(entity.getProducer().getId())
                        .build() : null)
                .onPromotion(entity.isOnPromotion())
                .promotionPrice(entity.getPromotionPrice())
                .promotionEndDate(entity.getPromotionEndDate())
                .totalSold(entity.getTotalSold())
                .active(entity.isActive())
                .createdAt(entity.getCreatedAt())
                .version(entity.getVersion())
                .build();
    }

    /**
     * Convierte una entidad de dominio Review a ReviewEntity.
     */
    private ReviewEntity toReviewEntity(Review review) {
        if (review == null) {
            return null;
        }
        return ReviewEntity.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .date(review.getDate())
                .buyer(review.getBuyer() != null ? 
                    UserEntity.builder().id(review.getBuyer().getId()).build() : null)
                .product(review.getProduct() != null ? 
                    ProductEntity.builder().id(review.getProduct().getId()).build() : null)
                .build();
    }

    /**
     * Convierte una ReviewEntity a entidad de dominio Review.
     */
    private Review toReviewDomain(ReviewEntity entity) {
        if (entity == null) {
            return null;
        }
        return Review.builder()
                .id(entity.getId())
                .rating(entity.getRating())
                .comment(entity.getComment())
                .date(entity.getDate())
                .buyer(entity.getBuyer() != null ? 
                    com.agromarket.domain.user.model.User.builder()
                        .id(entity.getBuyer().getId())
                        .build() : null)
                .product(entity.getProduct() != null ? 
                    Product.builder()
                        .id(entity.getProduct().getId())
                        .build() : null)
                .build();
    }

    @Override
    public Product save(Product product) {
        ProductEntity entity = toEntity(product);
        ProductEntity savedEntity = productJpaRepository.save(entity);
        return toDomain(savedEntity);
    }

    @Override
    public Optional<Product> findById(Long id) {
        return productJpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Product> findAll() {
        return productJpaRepository.findAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Product> findAllByActiveTrue() {
        return productJpaRepository.findByActiveTrue().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Product> findByFruitType(FruitType fruitType) {
        return productJpaRepository.findByFruitType(fruitType).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Product> findByProducerId(Long producerId) {
        return productJpaRepository.findByProducerId(producerId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Product> searchByNameOrDescription(String query) {
        if (query == null || query.isBlank()) {
            return findAll();
        }
        return productJpaRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                query, query).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Product> findByOnPromotionTrue() {
        return productJpaRepository.findByOnPromotionTrue().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Product product) {
        ProductEntity entity = toEntity(product);
        if (entity != null) {
            productJpaRepository.delete(entity);
        }
    }

    @Override
    public Review saveReview(Review review) {
        ReviewEntity entity = toReviewEntity(review);
        ReviewEntity savedEntity = reviewJpaRepository.save(entity);
        return toReviewDomain(savedEntity);
    }

    @Override
    public List<Review> findReviewsByProductId(Long productId) {
        return reviewJpaRepository.findByProductId(productId).stream()
                .map(this::toReviewDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsReviewByProductIdAndBuyerId(Long productId, Long buyerId) {
        return reviewJpaRepository.existsByProductIdAndBuyerId(productId, buyerId);
    }

    @Override
    public Optional<Review> findReviewById(Long reviewId) {
        return reviewJpaRepository.findById(reviewId).map(this::toReviewDomain);
    }
}
