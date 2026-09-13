package com.agromarket.application.adapters.persistence.mongodb.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.agromarket.application.adapters.persistence.mongodb.documents.ChatbotMessageDocument;

/**
 * Repositorio para mensajes del chatbot.
 */
@Repository
public interface ChatbotMessageRepository extends MongoRepository<ChatbotMessageDocument, String> {

    List<ChatbotMessageDocument> findByConversationIdOrderByTimestampAsc(String conversationId);

    List<ChatbotMessageDocument> findBySenderId(String senderId);

    List<ChatbotMessageDocument> findBySenderType(String senderType);

    List<ChatbotMessageDocument> findByConversationIdAndMessageType(String conversationId, String messageType);
}
