package com.agromarket.application.adapters.persistence.mongodb.repositories.config;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.agromarket.application.adapters.persistence.mongodb.documents.config.AppConfigDocument;

public interface AppConfigMongoRepository
        extends MongoRepository<AppConfigDocument, String> {
}