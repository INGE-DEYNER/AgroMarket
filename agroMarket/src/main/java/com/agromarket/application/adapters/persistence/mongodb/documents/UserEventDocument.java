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
 * Documento MongoDB para eventos de usuario.
 * Almacena eventos específicos del usuario para seguimiento y análisis.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_events")
public class UserEventDocument {

    @Id
    private String id;

    @Indexed
    @Field("user_id")
    private String userId;

    @Field("event_name")
    private String eventName;

    @Field("event_data")
    private Object eventData;

    @Field("source")
    private String source;

    @Indexed
    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("processed")
    private Boolean processed;

    @Field("processing_attempts")
    private Integer processingAttempts;
}
