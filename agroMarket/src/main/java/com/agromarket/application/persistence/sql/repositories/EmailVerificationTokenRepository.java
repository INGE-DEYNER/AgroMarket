package com.agromarket.application.persistence.sql.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.application.persistence.sql.entities.EmailVerificationTokenEntity;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationTokenEntity, Long> {
    Optional<EmailVerificationTokenEntity> findByToken(String token);

    @Modifying
    @Transactional
    void deleteByUsuarioId(Long usuarioId);
}
