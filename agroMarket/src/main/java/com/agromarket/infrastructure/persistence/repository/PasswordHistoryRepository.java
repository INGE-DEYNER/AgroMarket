package com.agromarket.infrastructure.persistence.repository;

import java.util.List;

import com.agromarket.infrastructure.persistence.entity.PasswordHistoryEntity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordHistoryRepository extends JpaRepository<PasswordHistoryEntity, Long> {
    List<PasswordHistoryEntity> findByUsuarioId(Long usuarioId);
}
