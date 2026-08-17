
package com.agromarket.application.adapters.persistence.sql.repositories.order;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.adapters.persistence.sql.entities.order.OrderEntity;

public interface OrderJpaRepository extends JpaRepository<OrderEntity, Long> {

    List<OrderEntity> findByBuyerId(Long buyerId);

    List<OrderEntity> findByState(
            com.agromarket.domain.models.enums.order.OrderState state);
}