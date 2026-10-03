package com.agromarket.application.adapters.persistence.mongodb.repositories.messaging;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.agromarket.application.adapters.persistence.mongodb.documents.messaging.NotificationDocument;

public interface NotificationMongoRepository
        extends MongoRepository<NotificationDocument, String> {

    List<NotificationDocument> findByRecipientId(Long recipientId);
}
