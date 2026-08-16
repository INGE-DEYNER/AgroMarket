package com.agromarket.application.adapters.persistence.mongodb.repositories.admin;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.agromarket.application.adapters.persistence.mongodb.documents.admin.AdminDocument;

public interface AdminMongoRepository
        extends MongoRepository<AdminDocument, String> {

    Optional<AdminDocument> findByUserId(Long userId);

    List<AdminDocument> findByActiveTrue();
}
