package com.agromarket.application.adapters.persistence.sql.repositories.order;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.adapters.persistence.sql.entities.order.OrderItemEntity;

public interface OrderItemJpaRepository
        extends JpaRepository<OrderItemEntity, Long> {

    List<OrderItemEntity> findByOrder_Id(Long orderId);

    List<OrderItemEntity> findByProduct_Id(Long productId);
}
