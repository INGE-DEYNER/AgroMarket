package com.agromarket.application.adapters.persistence.mongodb.repositories.user;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.agromarket.application.adapters.persistence.mongodb.documents.user.PasswordHistoryDocument;

public interface PasswordHistoryMongoRepository
        extends MongoRepository<PasswordHistoryDocument, String> {

    List<PasswordHistoryDocument> findByUserIdOrderByUsedAtDesc(Long userId);

    boolean existsByUserIdAndPassword(Long userId, String password);
}
