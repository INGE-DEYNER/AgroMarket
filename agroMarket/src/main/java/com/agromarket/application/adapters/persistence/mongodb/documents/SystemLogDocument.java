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
 * Documento MongoDB para logs del sistema.
 * Almacena logs técnicos y de aplicación para debug y monitoreo.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "system_logs")
public class SystemLogDocument {

    @Id
    private String id;

    @Indexed
    @Field("level")
    private String level; // INFO, WARN, ERROR, DEBUG

    @Indexed
    @Field("logger")
    private String logger;

    @Field("message")
    private String message;

    @Field("exception")
    private String exception;

    @Field("stack_trace")
    private String stackTrace;

    @Field("thread")
    private String thread;

    @Field("host")
    private String host;

    @Field("metadata")
    private Object metadata;

    @Indexed
    @Field("created_at")
    private LocalDateTime createdAt;
}
