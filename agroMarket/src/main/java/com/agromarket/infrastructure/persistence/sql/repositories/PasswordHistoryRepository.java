package com.agromarket.infrastructure.persistence.sql.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.infrastructure.persistence.sql.entities.PasswordHistoryEntity;

public interface PasswordHistoryRepository extends JpaRepository<PasswordHistoryEntity, Long> {
    List<PasswordHistoryEntity> findByUsuarioId(Long usuarioId);
}
