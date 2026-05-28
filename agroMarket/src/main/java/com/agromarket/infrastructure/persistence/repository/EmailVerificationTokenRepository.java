package com.agromarket.infrastructure.persistence.repository;

import java.util.Optional;

import com.agromarket.infrastructure.persistence.entity.EmailVerificationTokenEntity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationTokenEntity, Long> {
    Optional<EmailVerificationTokenEntity> findByToken(String token);
    void deleteByUsuarioId(Long usuarioId);
}
