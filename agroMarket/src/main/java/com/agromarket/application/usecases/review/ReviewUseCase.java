package com.agromarket.application.usecases.review;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.domain.exceptions.review.ReviewNotFoundException;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.models.review.Review;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.out.product.ProductPort;
import com.agromarket.domain.ports.out.review.ReviewPort;
import com.agromarket.domain.ports.out.user.UserPort;
import com.agromarket.domain.services.review.ReviewService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewUseCase implements ReviewPort {

    private final ReviewPort reviewPersistencePort;
    private final UserPort userPort;
    private final ProductPort productPort;
    private final ReviewService reviewService;

    @Override
    @Transactional
    public Review create(
            Long productId,
            Long reviewerId,
            Integer rating,
            String comment) {

        User buyer = userPort.findById(reviewerId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe el usuario con id " + reviewerId));

        if (!buyer.isBuyer()) {
            throw new IllegalArgumentException(
                    "El usuario indicado no tiene rol BUYER");
        }

        Product product = productPort.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe el producto con id " + productId));

        Review review = Review.builder()
                .buyer(buyer)
                .product(product)
                .rating(rating)
                .comment(comment)
                .date(LocalDateTime.now())
                .build();

        reviewService.validate(review);

        reviewService.validateUniqueReview(
                reviewPersistencePort.existsByProductIdAndReviewerId(
                        productId,
                        reviewerId));

        return reviewPersistencePort.save(review);
    }

    @Override
    @Transactional(readOnly = true)
    public Review getById(Long id) {
        return findReview(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Review> getByProductId(Long productId) {
        return reviewPersistencePort.findByProductId(productId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Review> getByReviewerId(Long reviewerId) {
        return reviewPersistencePort.findByReviewerId(reviewerId);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Review review = findReview(id);
        reviewPersistencePort.delete(review);
    }

    private Review findReview(Long id) {
        return reviewPersistencePort.findById(id)
                .orElseThrow(() -> new ReviewNotFoundException(
                        "No existe la reseña con id " + id));
    }
}
