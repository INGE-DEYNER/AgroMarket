package com.agromarket.infrastructure.persistence.mongo.documents;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.agromarket.domain.user.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "auth_access_events")
public class AuthAccessEventDocument {
    @Id
    private String id;

    @Indexed
    private Long userId;

    @Indexed
    private String email;

    private Role role;
    private String action;
    private boolean success;
    private String sessionId;
    private String ipAddress;
    private String userAgent;
    private String details;
    private Instant createdAt;
    private Instant expiresAt;
}