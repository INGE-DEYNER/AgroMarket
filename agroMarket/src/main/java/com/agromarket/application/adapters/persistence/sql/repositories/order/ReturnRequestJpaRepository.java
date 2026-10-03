package com.agromarket.application.adapters.persistence.sql.repositories.order;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.agromarket.application.adapters.persistence.sql.entities.order.ReturnRequestEntity;
import com.agromarket.domain.models.enums.order.ReturnStatus;

public interface ReturnRequestJpaRepository extends JpaRepository<ReturnRequestEntity, Long> {

    List<ReturnRequestEntity> findByBuyer_IdOrderByCreatedAtDesc(Long buyerId);

    List<ReturnRequestEntity> findAllByOrderByCreatedAtDesc();

    List<ReturnRequestEntity> findByStatusOrderByCreatedAtDesc(ReturnStatus status);

    Optional<ReturnRequestEntity> findByIdempotencyKey(String idempotencyKey);

    Optional<ReturnRequestEntity> findFirstByOrder_IdAndStatusInOrderByCreatedAtDesc(
            Long orderId, List<ReturnStatus> statuses);

    long countByStatus(ReturnStatus status);

    /**
     * Carga la solicitud con sus ítems y evidencias para evitar
     * LazyInitializationException al construir la respuesta HTTP.
     */
    @Query("""
            select distinct r from ReturnRequestEntity r
            left join fetch r.items i
            left join fetch i.product
            left join fetch r.evidences
            where r.id = :id
            """)
    Optional<ReturnRequestEntity> findByIdWithDetails(@Param("id") Long id);
}
