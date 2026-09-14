package com.agromarket.application.adapters.persistence.mongodb.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.agromarket.application.adapters.persistence.mongodb.documents.ChatbotConversationDocument;

/**
 * Repositorio para conversaciones del chatbot.
 */
public interface ChatbotConversationRepository extends MongoRepository<ChatbotConversationDocument, String> {

    List<ChatbotConversationDocument> findByUserId(String userId);

    List<ChatbotConversationDocument> findBySessionId(String sessionId);

    List<ChatbotConversationDocument> findByStatus(String status);

    List<ChatbotConversationDocument> findByUserIdAndStatus(String userId, String status);
}
