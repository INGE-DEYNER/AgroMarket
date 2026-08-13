package com.agromarket.infrastructure.persistence.mongo.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.agromarket.infrastructure.persistence.mongo.documents.AuthAccessEventDocument;

public interface AuthAccessEventMongoRepository extends MongoRepository<AuthAccessEventDocument, String> {
    List<AuthAccessEventDocument> findTop20ByEmailOrderByCreatedAtDesc(String email);
    List<AuthAccessEventDocument> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);
}