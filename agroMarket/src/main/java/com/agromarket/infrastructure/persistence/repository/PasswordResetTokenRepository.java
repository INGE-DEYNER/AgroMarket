package com.agromarket.infrastructure.persistence.repository;

import java.util.Optional;

import com.agromarket.infrastructure.persistence.entity.PasswordResetTokenEntity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetTokenEntity, Long> {
    Optional<PasswordResetTokenEntity> findByToken(String token);
    void deleteByUsuarioId(Long usuarioId);
}
