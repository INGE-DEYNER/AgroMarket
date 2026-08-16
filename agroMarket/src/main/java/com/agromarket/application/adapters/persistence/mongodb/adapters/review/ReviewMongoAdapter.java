package com.agromarket.application.adapters.persistence.mongodb.adapters.review;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.agromarket.application.adapters.persistence.mongodb.documents.review.ReviewDocument;
import com.agromarket.application.adapters.persistence.mongodb.repositories.review.ReviewMongoRepository;
import com.agromarket.domain.models.review.Review;
import com.agromarket.domain.ports.out.review.ReviewPort;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ReviewMongoAdapter implements ReviewPort {

    private final ReviewMongoRepository repository;

    @Override
    public Review save(Review review) {
        return repository.save(ReviewDocument.fromDomain(review))
                .toDomain();
    }

    @Override
    public Optional<Review> findById(Long id) {
        return repository.findById(id.toString())
                .map(ReviewDocument::toDomain);
    }

    @Override
    public List<Review> findByProductId(Long productId) {
        return repository.findByProductId(productId)
                .stream()
                .map(ReviewDocument::toDomain)
                .toList();
    }

    @Override
    public List<Review> findByReviewerId(Long reviewerId) {
        return repository.findByBuyerId(reviewerId)
                .stream()
                .map(ReviewDocument::toDomain)
                .toList();
    }

    @Override
    public boolean existsByProductIdAndReviewerId(
            Long productId,
            Long reviewerId) {

        return repository.existsByProductIdAndBuyerId(
                productId,
                reviewerId);
    }

    @Override
    public void delete(Review review) {
        if (review != null && review.getId() != null) {
            repository.deleteById(review.getId().toString());
        }
    }
}
