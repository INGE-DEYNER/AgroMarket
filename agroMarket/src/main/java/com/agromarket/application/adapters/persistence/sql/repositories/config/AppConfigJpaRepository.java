package com.agromarket.application.adapters.persistence.sql.repositories.config;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.adapters.persistence.sql.entities.config.AppConfigEntity;

public interface AppConfigJpaRepository
        extends JpaRepository<AppConfigEntity, String> {
}
