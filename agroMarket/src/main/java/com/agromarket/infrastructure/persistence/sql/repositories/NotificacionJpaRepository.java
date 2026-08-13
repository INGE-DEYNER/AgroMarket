package com.agromarket.infrastructure.persistence.sql.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.infrastructure.persistence.sql.entities.NotificacionEntity;

public interface NotificacionJpaRepository extends JpaRepository<NotificacionEntity, Long> {
    List<NotificacionEntity> findByDestinatarioId(Long userId);

    long countByDestinatarioIdAndLeidaFalse(Long userId);

    @Transactional
    @Modifying
    @Query("update NotificacionEntity n set n.leida = true where n.destinatario.id = :userId")
    void marcarTodasLeidas(@Param("userId") Long userId);
}
