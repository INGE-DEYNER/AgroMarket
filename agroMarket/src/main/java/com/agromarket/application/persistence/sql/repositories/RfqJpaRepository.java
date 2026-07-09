package com.agromarket.application.persistence.sql.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.persistence.sql.entities.RfqEntity;

public interface RfqJpaRepository extends JpaRepository<RfqEntity, Long> {
    List<RfqEntity> findByCompradorId(Long compradorId);
    List<RfqEntity> findByActivoTrue();
}
