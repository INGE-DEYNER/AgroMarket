package com.agromarket.application.adapters.persistence.sql.entities.user;

import java.time.Instant;

import jakarta.persistence.*;

import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.models.user.AuthAccessEvent;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "auth_access_events",
       indexes = {
           @Index(name = "idx_auth_event_user_created", columnList = "user_id,created_at"),
           @Index(name = "idx_auth_event_email_created", columnList = "email,created_at")
       })
@Getter
@Setter
@NoArgsConstructor
public class AuthAccessEventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    private String email;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String action;
    private boolean success;
    private String sessionId;
    private String ipAddress;

    @Column(length = 1000)
    private String userAgent;

    @Column(length = 2000)
    private String details;

    private Instant expiresAt;
    private Instant createdAt;

    public AuthAccessEvent toDomain() {
        return AuthAccessEvent.builder()
                .userId(user == null ? null : user.getId())
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

    public static AuthAccessEventEntity fromDomain(AuthAccessEvent event, UserEntity user) {
        AuthAccessEventEntity entity = new AuthAccessEventEntity();
        entity.user = user;
        entity.email = event.getEmail();
        entity.role = event.getRole();
        entity.action = event.getAction();
        entity.success = event.isSuccess();
        entity.sessionId = event.getSessionId();
        entity.ipAddress = event.getIpAddress();
        entity.userAgent = event.getUserAgent();
        entity.details = event.getDetails();
        entity.expiresAt = event.getExpiresAt();
        entity.createdAt = Instant.now();
        return entity;
    }
}
