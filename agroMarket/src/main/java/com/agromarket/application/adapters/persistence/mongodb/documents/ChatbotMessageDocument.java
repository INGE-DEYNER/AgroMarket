package com.agromarket.application.adapters.persistence.mongodb.documents;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Documento MongoDB para mensajes del chatbot.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chatbot_messages")
public class ChatbotMessageDocument {

    @Id
    private String id;

    @Field("conversation_id")
    private String conversationId;

    @Field("message_type")
    private String messageType; // USER, BOT, SYSTEM

    @Field("content")
    private String content;

    @Field("content_json")
    private Object contentJson;

    @Field("sender_id")
    private String senderId;

    @Field("sender_type")
    private String senderType; // USER, BOT

    @Field("timestamp")
    private LocalDateTime timestamp;

    @Field("read")
    private Boolean read;

    @Field("metadata")
    private Object metadata;
}
