package com.agromarket.application.adapters.persistence.mongodb.documents;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Documento MongoDB para el historial de actividad de usuarios.
 * Almacena eventos de actividad para análisis y auditoría.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_activity_logs")
public class UserActivityLogDocument {

    @Id
    private String id;

    @Indexed
    @Field("user_id")
    private String userId;

    @Field("event_type")
    private String eventType;

    @Field("event_action")
    private String eventAction;

    @Field("resource_type")
    private String resourceType;

    @Field("resource_id")
    private String resourceId;

    @Field("ip_address")
    private String ipAddress;

    @Field("user_agent")
    private String userAgent;

    @Field("metadata")
    private Object metadata;

    @Field("created_at")
    @Indexed
    private LocalDateTime createdAt;
}
