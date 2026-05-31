package com.agromarket.infrastructure.persistence.repository;

import com.agromarket.infrastructure.persistence.entity.CompradorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompradorJpaRepository extends JpaRepository<CompradorEntity, Long> {
}
