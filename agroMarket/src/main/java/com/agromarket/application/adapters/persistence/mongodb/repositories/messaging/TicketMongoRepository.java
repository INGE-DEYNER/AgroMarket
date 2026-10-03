package com.agromarket.application.adapters.persistence.mongodb.repositories.messaging;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.agromarket.application.adapters.persistence.mongodb.documents.messaging.TicketDocument;

/**
 * Repositorio Mongo de los tickets de soporte.
 */
public interface TicketMongoRepository
        extends MongoRepository<TicketDocument, String> {

    List<TicketDocument> findByCreatorIdOrderByUpdatedAtDesc(Long creatorId);

    List<TicketDocument> findAllByOrderByUpdatedAtDesc();
}
