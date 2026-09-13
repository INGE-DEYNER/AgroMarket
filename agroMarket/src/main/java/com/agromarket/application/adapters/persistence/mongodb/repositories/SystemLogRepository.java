package com.agromarket.application.adapters.persistence.mongodb.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.agromarket.application.adapters.persistence.mongodb.documents.SystemLogDocument;

/**
 * Repositorio para logs del sistema.
 */
@Repository
public interface SystemLogRepository extends MongoRepository<SystemLogDocument, String> {

    List<SystemLogDocument> findByLevel(String level);

    List<SystemLogDocument> findByLevelAndCreatedAtBetween(String level, LocalDateTime start, LocalDateTime end);

    List<SystemLogDocument> findByLogger(String logger);

    List<SystemLogDocument> findByMessageContaining(String message);
}
