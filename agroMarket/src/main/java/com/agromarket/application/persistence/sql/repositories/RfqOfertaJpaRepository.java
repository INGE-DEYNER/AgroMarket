package com.agromarket.application.persistence.sql.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.persistence.sql.entities.RfqOfertaEntity;

public interface RfqOfertaJpaRepository extends JpaRepository<RfqOfertaEntity, Long> {
    List<RfqOfertaEntity> findByRfqId(Long rfqId);
    List<RfqOfertaEntity> findByProductorId(Long productorId);
    boolean existsByRfqIdAndProductorId(Long rfqId, Long productorId);
}
