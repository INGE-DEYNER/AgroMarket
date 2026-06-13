package com.agromarket.infrastructure.persistence.repository;

import java.util.List;
import com.agromarket.infrastructure.persistence.entity.RfqEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RfqJpaRepository extends JpaRepository<RfqEntity, Long> {
    List<RfqEntity> findByCompradorId(Long compradorId);
    List<RfqEntity> findByActivoTrue();
}
