package com.agromarket.infrastructure.persistence.mongodb.adapters;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.agromarket.domain.user.enums.Role;
import com.agromarket.domain.user.ports.out.AuthEventRepository;
import com.agromarket.infrastructure.persistence.mongo.documents.AuthAccessEventDocument;
import com.agromarket.infrastructure.persistence.mongo.repositories.AuthAccessEventMongoRepository;

import lombok.RequiredArgsConstructor;

/**
 * Adaptador MongoDB que implementa el puerto AuthEventRepository.
 * Este adaptador gestiona el registro de eventos de autenticación y acceso
 * en MongoDB para auditoría y seguridad.
 * 
 * <p>Centraliza las operaciones de persistencia relacionadas con eventos de autenticación,
 * evitando que el dominio dependa directamente de MongoDB o Spring Data.</p>
 * 
 * @author AgroMarket Team
 */
@Component
@RequiredArgsConstructor
public class AuthAccessEventMongoAdapter implements AuthEventPort {

    private final AuthAccessEventMongoRepository authAccessEventMongoRepository;
    
    @Override
    public void logAuthEvent(Long userId, String email, Role role, String action, 
                            boolean success, String sessionId, String ipAddress, 
                            String userAgent, String details, Instant expiresAt) {
        AuthAccessEventDocument document = AuthAccessEventDocument.builder()
                .userId(userId)
                .email(email)
                .role(role)
                .action(action)
                .success(success)
                .sessionId(sessionId)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .details(details)
                .createdAt(Instant.now())
                .expiresAt(expiresAt)
                .build();
        
        authAccessEventMongoRepository.save(document);
    }
    
    @Override
    public List<AuthAccessEventDocument> getEventsByUserId(Long userId) {
        return authAccessEventMongoRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    @Override
    public List<AuthAccessEventDocument> getEventsByEmail(String email) {
        return authAccessEventMongoRepository.findByEmailOrderByCreatedAtDesc(email);
    }
    
    @Override
    public List<AuthAccessEventDocument> getFailedLoginAttempts(String email, Instant since) {
        return authAccessEventMongoRepository.findByEmailAndActionAndSuccessAndCreatedAtAfter(
                email, "LOGIN", false, since)
                .stream()
                .collect(Collectors.toList());
    }
    
    @Override
    public void deleteExpiredEvents(Instant now) {
        authAccessEventMongoRepository.deleteByExpiresAtBefore(now);
    }
}
