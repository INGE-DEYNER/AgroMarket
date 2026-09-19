package com.agromarket.application.adapters.persistence.sql.repositories.user;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.adapters.persistence.sql.entities.user.AuthAccessEventEntity;

public interface AuthAccessEventJpaRepository extends JpaRepository<AuthAccessEventEntity, Long> {

    List<AuthAccessEventEntity> findByUser_IdOrderByCreatedAtDesc(Long userId);

    List<AuthAccessEventEntity> findByEmailOrderByCreatedAtDesc(String email);

    List<AuthAccessEventEntity> findByEmailAndSuccessFalseAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(
            String email, Instant since);

    void deleteByExpiresAtBefore(Instant now);
}
