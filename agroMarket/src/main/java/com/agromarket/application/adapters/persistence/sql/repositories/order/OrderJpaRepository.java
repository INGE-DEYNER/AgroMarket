package com.agromarket.application.adapters.persistence.sql.repositories.order;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import com.agromarket.application.adapters.persistence.sql.entities.order.OrderEntity;
import com.agromarket.domain.models.enums.order.OrderState;

public interface OrderJpaRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByBuyer_Id(Long buyerId);

    @Query("select o from OrderEntity o where o.product.producer.id = :producerId")
    List<OrderEntity> findByProducerId(@Param("producerId") Long producerId);

    List<OrderEntity> findByState(OrderState state);
}
