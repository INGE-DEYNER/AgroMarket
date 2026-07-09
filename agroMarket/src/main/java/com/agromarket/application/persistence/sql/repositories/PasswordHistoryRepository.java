package com.agromarket.application.persistence.sql.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.persistence.sql.entities.PasswordHistoryEntity;

public interface PasswordHistoryRepository extends JpaRepository<PasswordHistoryEntity, Long> {
    List<PasswordHistoryEntity> findByUsuarioId(Long usuarioId);
}
