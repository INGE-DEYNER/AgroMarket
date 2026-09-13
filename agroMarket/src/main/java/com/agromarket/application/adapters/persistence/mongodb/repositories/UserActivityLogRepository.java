package com.agromarket.application.adapters.persistence.mongodb.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.agromarket.application.adapters.persistence.mongodb.documents.UserActivityLogDocument;

/**
 * Repositorio para el historial de actividad de usuarios.
 */
@Repository
public interface UserActivityLogRepository extends MongoRepository<UserActivityLogDocument, String> {

    List<UserActivityLogDocument> findByUserId(String userId);

    List<UserActivityLogDocument> findByUserIdAndCreatedAtBetween(String userId, LocalDateTime start, LocalDateTime end);

    List<UserActivityLogDocument> findByEventType(String eventType);

    List<UserActivityLogDocument> findByResourceTypeAndResourceId(String resourceType, String resourceId);
}
