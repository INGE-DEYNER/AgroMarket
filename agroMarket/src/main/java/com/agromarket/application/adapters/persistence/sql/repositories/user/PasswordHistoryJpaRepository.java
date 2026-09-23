package com.agromarket.application.adapters.persistence.sql.repositories.user;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.adapters.persistence.sql.entities.user.PasswordHistoryEntity;

public interface PasswordHistoryJpaRepository extends JpaRepository<PasswordHistoryEntity, Long> {

    List<PasswordHistoryEntity> findByUser_IdOrderByUsedAtDesc(Long userId);

    boolean existsByUser_IdAndPassword(Long userId, String password);
}
