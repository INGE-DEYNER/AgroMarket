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

    /**
     * Identificadores de los interlocutores de este usuario (quien le escribió
     * o a quien le escribió), sin repetir y sin incluirse a sí mismo.
     */
    @Query(value = "{ $or: [ " +
            "{ 'senderId': ?0 }, " +
            "{ 'recipientId': ?0 } " +
            "] }",
            fields = "{ 'senderId': 1, 'recipientId': 1 }")
    List<MessageDocument> findConversationPartners(Long userId);
}
