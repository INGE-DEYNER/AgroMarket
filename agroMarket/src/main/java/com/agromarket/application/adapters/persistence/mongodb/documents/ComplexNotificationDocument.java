package com.agromarket.application.adapters.persistence.mongodb.documents;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Documento MongoDB para notificaciones complejas y su historial.
 * Almacena notificaciones con estructura flexible y su historial completo.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "complex_notifications")
public class ComplexNotificationDocument {

    @Id
    private String id;

    @Indexed
    @Field("user_id")
    private String userId;

    @Field("type")
    private String type;

    @Field("title")
    private String title;

    @Field("message")
    private String message;

    @Field("template_data")
    private Object templateData;

    @Field("actions")
    private List<NotificationAction> actions;

    @Field("priority")
    private Integer priority;

    @Field("status")
    private String status; // PENDING, SENT, READ, DISMISSED

    @Field("channel")
    private String channel; // EMAIL, SMS, PUSH, IN_APP

    @Field("sent_at")
    private LocalDateTime sentAt;

    @Field("read_at")
    private LocalDateTime readAt;

    @Field("dismissed_at")
    private LocalDateTime dismissedAt;

    @Indexed
    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;

    @Field("metadata")
    private Object metadata;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationAction {
        private String label;
        private String url;
        private String actionType;
        private Object data;
    }
}
