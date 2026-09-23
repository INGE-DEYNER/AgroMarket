package com.agromarket.application.adapters.persistence.mongodb.documents;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Documento MongoDB para conversaciones del chatbot.
 * Almacena el historial completo de interacciones del chatbot.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chatbot_conversations")
public class ChatbotConversationDocument {

    @Id
    private String id;

    @Field("user_id")
    private String userId;

    @Field("session_id")
    private String sessionId;

    @Field("conversation_type")
    private String conversationType;

    @Field("messages")
    private List<ChatbotMessageDocument> messages;

    @Field("status")
    private String status;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;

    @Field("last_message_at")
    private LocalDateTime lastMessageAt;

    @Field("metadata")
    private Object metadata;
}
