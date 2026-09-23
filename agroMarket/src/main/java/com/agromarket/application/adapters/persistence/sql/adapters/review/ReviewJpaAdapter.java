package com.agromarket.application.adapters.persistence.sql.adapters.review;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.application.adapters.persistence.sql.entities.product.ProductEntity;
import com.agromarket.application.adapters.persistence.sql.entities.review.ReviewEntity;
import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.product.ProductJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.review.ReviewJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.user.UserJpaRepository;
import com.agromarket.domain.models.review.Review;
import com.agromarket.domain.ports.out.review.ReviewPort;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
@Transactional
public class ReviewJpaAdapter implements ReviewPort {

    private final ReviewJpaRepository repository;
    private final UserJpaRepository userRepository;
    private final ProductJpaRepository productRepository;

    @Override
    public Review save(Review review) {

        UserEntity buyer = userRepository.findById(
                review.getBuyer().getId()
        ).orElseThrow(() ->
                new IllegalArgumentException("Comprador no encontrado"));

        ProductEntity product = productRepository.findById(
                review.getProduct().getId()
        ).orElseThrow(() ->
                new IllegalArgumentException("Producto no encontrado"));

        return repository.save(
                ReviewEntity.fromDomain(
                        review,
                        buyer,
                        product
                )
        ).toDomain();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Review> findById(Long id) {

        return repository.findById(id)
                .map(ReviewEntity::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Review> findByProductId(Long productId) {

        return repository.findByProduct_Id(productId)
                .stream()
                .map(ReviewEntity::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Review> findByReviewerId(Long reviewerId) {

        return repository.findByBuyer_Id(reviewerId)
                .stream()
                .map(ReviewEntity::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByProductIdAndReviewerId(
            Long productId,
            Long reviewerId) {

        return repository.existsByProduct_IdAndBuyer_Id(
                productId,
                reviewerId
        );
    }

    @Override
    public void delete(Review review) {

        if (review != null && review.getId() != null) {
            repository.deleteById(review.getId());
        }
    }
}
