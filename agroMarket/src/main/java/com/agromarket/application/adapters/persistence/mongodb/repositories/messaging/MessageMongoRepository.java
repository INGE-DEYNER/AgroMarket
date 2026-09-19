package com.agromarket.application.adapters.persistence.mongodb.repositories.messaging;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.agromarket.application.adapters.persistence.mongodb.documents.messaging.MessageDocument;

public interface MessageMongoRepository extends MongoRepository<MessageDocument, String> {

    @Query("{ '$or': [ " +
            "{ 'senderId': ?0, 'recipientId': ?1 }, " +
            "{ 'senderId': ?1, 'recipientId': ?0 } " +
            "] }")
    List<MessageDocument> findConversation(Long userA, Long userB);
}
