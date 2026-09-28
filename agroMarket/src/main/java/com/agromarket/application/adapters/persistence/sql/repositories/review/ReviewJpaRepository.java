package com.agromarket.application.adapters.persistence.sql.repositories.review;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.adapters.persistence.sql.entities.review.ReviewEntity;

public interface ReviewJpaRepository
        extends JpaRepository<ReviewEntity, Long> {

    List<ReviewEntity> findByProduct_Id(Long productId);

    /**
     * Listado global para el panel de administracion (alias
     * {@code GET /api/v1/reviews}). Sin este metodo el listado de resenas del
     * admin devolvia 404.
     */
    List<ReviewEntity> findAllByOrderByDateDesc();

    List<ReviewEntity> findByBuyer_Id(Long buyerId);

    boolean existsByProduct_IdAndBuyer_Id(
            Long productId,
            Long buyerId);
}
