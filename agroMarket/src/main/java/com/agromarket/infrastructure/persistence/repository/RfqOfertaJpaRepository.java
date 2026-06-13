package com.agromarket.infrastructure.persistence.repository;

import java.util.List;
import com.agromarket.infrastructure.persistence.entity.RfqOfertaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RfqOfertaJpaRepository extends JpaRepository<RfqOfertaEntity, Long> {
    List<RfqOfertaEntity> findByRfqId(Long rfqId);
    List<RfqOfertaEntity> findByProductorId(Long productorId);
    boolean existsByRfqIdAndProductorId(Long rfqId, Long productorId);
}
