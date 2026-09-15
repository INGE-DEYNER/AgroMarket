package com.agromarket.application.adapters.persistence.sql.adapters.user;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.application.adapters.persistence.sql.entities.user.AuthAccessEventEntity;
import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.user.AuthAccessEventJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.user.UserJpaRepository;
import com.agromarket.domain.models.user.AuthAccessEvent;
import com.agromarket.domain.ports.out.user.AuthEventPort;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
@Transactional
public class AuthEventJpaAdapter
        implements AuthEventPort {

    private final AuthAccessEventJpaRepository repository;
    private final UserJpaRepository userRepository;

    @Override
    public void logAuthEvent(AuthAccessEvent event) {

        UserEntity user = null;

        if (event.getUserId() != null) {
            user = userRepository.findById(event.getUserId())
                    .orElse(null);
        }

        repository.save(
                AuthAccessEventEntity.fromDomain(
                        event,
                        user
                )
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuthAccessEvent> getEventsByUserId(
            Long userId) {

        return repository
                .findByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(AuthAccessEventEntity::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuthAccessEvent> getEventsByEmail(
            String email) {

        return repository
                .findByEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(AuthAccessEventEntity::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuthAccessEvent> getFailedLoginAttempts(
            String email,
            Instant since) {

        return repository
                .findByEmailAndSuccessFalseAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(
                        email,
                        since
                )
                .stream()
                .map(AuthAccessEventEntity::toDomain)
                .toList();
    }

    @Override
    public void deleteExpiredEvents(Instant now) {

        repository.deleteByExpiresAtBefore(now);
    }
}
