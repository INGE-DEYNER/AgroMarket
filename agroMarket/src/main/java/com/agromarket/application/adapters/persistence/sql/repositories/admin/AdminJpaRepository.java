package com.agromarket.application.adapters.persistence.sql.repositories.admin;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.adapters.persistence.sql.entities.admin.AdminEntity;

public interface AdminJpaRepository
        extends JpaRepository<AdminEntity, Long> {

    Optional<AdminEntity> findByUserId(Long userId);

    List<AdminEntity> findByActiveTrue();
}
