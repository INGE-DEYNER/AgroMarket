package com.agromarket.infrastructure.persistence.sql.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.infrastructure.persistence.sql.entities.ShippingEntity;

public interface ShippingJpaRepository extends JpaRepository<ShippingEntity, Long> {
    Optional<ShippingEntity> findByOrderId(Long orderId);

    List<ShippingEntity> findByOrderBuyerId(Long buyerId);

    List<ShippingEntity> findByOrderProductProducerId(Long producerId);
}
