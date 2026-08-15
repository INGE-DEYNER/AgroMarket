package com.agromarket.application.adapters.persistence.mongodb.documents.user  ;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.models.user.AuthAccessEvent;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "auth_access_events")
@CompoundIndex(name = "idx_auth_event_user_created", def = "{'userId': 1, 'createdAt': -1}")
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
    private Instant expiresAt;
    private Instant createdAt;

    public AuthAccessEvent toDomain() {
        return AuthAccessEvent.builder()
                .userId(userId)
                .email(email)
                .role(role)
                .action(action)
                .success(success)
                .sessionId(sessionId)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .details(details)
                .expiresAt(expiresAt)
                .build();
    }

    public static AuthAccessEventDocument fromDomain(AuthAccessEvent event) {
        return AuthAccessEventDocument.builder()
                .userId(event.getUserId())
                .email(event.getEmail())
                .role(event.getRole())
                .action(event.getAction())
                .success(event.isSuccess())
                .sessionId(event.getSessionId())
                .ipAddress(event.getIpAddress())
                .userAgent(event.getUserAgent())
                .details(event.getDetails())
                .expiresAt(event.getExpiresAt())
                .createdAt(Instant.now())
                .build();
    }
}
