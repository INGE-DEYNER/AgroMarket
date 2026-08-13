package com.agromarket.infrastructure.persistence.mongo;

import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.agromarket.infrastructure.persistence.mongo.documents.AuthAccessEventDocument;
import com.agromarket.infrastructure.persistence.mongo.repositories.AuthAccessEventMongoRepository;
import com.agromarket.domain.models.enums.RolUsuario;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthAccessEventService {
    private final AuthAccessEventMongoRepository repository;

    public void recordFailure(String email, Long userId, RolUsuario rol, String action, String reason, String ipAddress, String userAgent) {
        saveEvent(email, userId, rol, action, false, reason, ipAddress, userAgent);
    }

    public void recordSuccessfulLogin(String email, Long userId, RolUsuario rol, String action, String ipAddress, String userAgent) {
        saveEvent(email, userId, rol, action, true, null, ipAddress, userAgent);
    }

    public void recordPendingTwoFactor(String email, Long userId, RolUsuario rol, String ipAddress, String userAgent) {
        saveEvent(email, userId, rol, "LOGIN_PENDING_2FA", true, "Se requiere verificación en dos pasos", ipAddress, userAgent);
    }

    public void recordLogout(String email, Long userId, RolUsuario rol, String ipAddress, String userAgent) {
        saveEvent(email, userId, rol, "LOGOUT", true, null, ipAddress, userAgent);
    }

    private void saveEvent(String email, Long userId, RolUsuario rol, String action, boolean success, String details, String ipAddress, String userAgent) {
        repository.save(AuthAccessEventDocument.builder()
                .id(UUID.randomUUID().toString())
                .sessionId(UUID.randomUUID().toString())
                .userId(userId)
                .email(normalize(email))
                .rol(rol)
                .action(action)
                .success(success)
                .details(details)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .createdAt(Instant.now())
                .build());
    }

    private String normalize(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}