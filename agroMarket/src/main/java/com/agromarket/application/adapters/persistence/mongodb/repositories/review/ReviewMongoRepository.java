package com.agromarket.application.adapters.persistence.mongodb.repositories.review;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.agromarket.application.adapters.persistence.mongodb.documents.review.ReviewDocument;

public interface ReviewMongoRepository
        extends MongoRepository<ReviewDocument, String> {

    List<ReviewDocument> findByProductId(Long productId);

    List<ReviewDocument> findByBuyerId(Long buyerId);

    boolean existsByProductIdAndBuyerId(Long productId, Long buyerId);
}
