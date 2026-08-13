package com.agromarket.infrastructure.persistence.sql.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.infrastructure.persistence.sql.entities.CompradorEntity;

public interface CompradorJpaRepository extends JpaRepository<CompradorEntity, Long> {
}
