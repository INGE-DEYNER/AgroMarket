package com.agromarket.application.persistence.sql.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.persistence.sql.entities.CompradorEntity;

public interface CompradorJpaRepository extends JpaRepository<CompradorEntity, Long> {
}
