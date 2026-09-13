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
 * Documento MongoDB para metadata variable.
 * Permite almacenar datos flexibles y dinámicos que no tienen una estructura fija.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "dynamic_metadata")
public class DynamicMetadataDocument {

    @Id
    private String id;

    @Indexed
    @Field("entity_type")
    private String entityType;

    @Indexed
    @Field("entity_id")
    private String entityId;

    @Field("metadata_key")
    private String metadataKey;

    @Field("metadata_value")
    private Object metadataValue;

    @Field("metadata_json")
    private Object metadataJson;

    @Indexed
    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;

    @Field("expires_at")
    private LocalDateTime expiresAt;

    @Field("active")
    private Boolean active;
}
