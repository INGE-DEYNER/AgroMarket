package com.agromarket.application.adapters.persistence.sql.repositories.shipping;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.adapters.persistence.sql.entities.shipping.ShippingEntity;

public interface ShippingJpaRepository
        extends JpaRepository<ShippingEntity, Long> {

    List<ShippingEntity> findByOrder_Id(Long orderId);

    List<ShippingEntity> findByBuyerId(Long buyerId);

    List<ShippingEntity> findByProducerId(Long producerId);
}
