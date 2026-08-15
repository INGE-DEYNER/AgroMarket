package com.agromarket.application.adapters.persistence.mongodb.adapters.user;

import java.time.Instant;
import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.agromarket.application.adapters.persistence.mongodb.documents.user.AuthAccessEventDocument;
import com.agromarket.application.adapters.persistence.mongodb.repositories.user.AuthAccessEventMongoRepository;
import com.agromarket.domain.models.user.AuthAccessEvent;
import com.agromarket.domain.ports.out.user.AuthEventPort;

@Component
@Profile("mongo")
public class AuthEventMongoAdapter implements AuthEventPort {

    private final AuthAccessEventMongoRepository repository;

    public AuthEventMongoAdapter(AuthAccessEventMongoRepository repository) {
        this.repository = repository;
    }

    @Override
    public void logAuthEvent(AuthAccessEvent event) {
        repository.save(AuthAccessEventDocument.fromDomain(event));
    }

    @Override
    public List<AuthAccessEvent> getEventsByUserId(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(AuthAccessEventDocument::toDomain).toList();
    }

    @Override
    public List<AuthAccessEvent> getEventsByEmail(String email) {
        return repository.findByEmailOrderByCreatedAtDesc(email)
                .stream().map(AuthAccessEventDocument::toDomain).toList();
    }

    @Override
    public List<AuthAccessEvent> getFailedLoginAttempts(String email, Instant since) {
        return repository
                .findByEmailAndSuccessFalseAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(email, since)
                .stream().map(AuthAccessEventDocument::toDomain).toList();
    }

    @Override
    public void deleteExpiredEvents(Instant now) {
        repository.deleteByExpiresAtBefore(now);
    }
}
