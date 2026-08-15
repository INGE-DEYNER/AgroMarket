package com.agromarket.application.adapters.persistence.mongodb.repositories.user;

import java.time.Instant;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.agromarket.application.adapters.persistence.mongodb.documents.user.AuthAccessEventDocument;

public interface AuthAccessEventMongoRepository
        extends MongoRepository<AuthAccessEventDocument, String> {

    List<AuthAccessEventDocument> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<AuthAccessEventDocument> findByEmailOrderByCreatedAtDesc(String email);

    List<AuthAccessEventDocument> findByEmailAndSuccessFalseAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(
            String email, Instant since);

    void deleteByExpiresAtBefore(Instant now);
}
