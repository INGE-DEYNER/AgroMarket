package com.agromarket.application.persistence.sql.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.application.persistence.sql.entities.PasswordResetTokenEntity;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetTokenEntity, Long> {
    Optional<PasswordResetTokenEntity> findByToken(String token);
    Optional<PasswordResetTokenEntity> findFirstByUsuarioIdOrderByIdDesc(Long usuarioId);

    @Modifying
    @Transactional
    void deleteByUsuarioId(Long usuarioId);
}
