package com.agromarket.infrastructure.persistence.repository;

import java.util.List;

import com.agromarket.infrastructure.persistence.entity.MensajeEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MensajeJpaRepository extends JpaRepository<MensajeEntity, Long> {
    @Query("""
            select m from MensajeEntity m
            where (m.remitente.id = :userId1 and m.destinatario.id = :userId2)
               or (m.remitente.id = :userId2 and m.destinatario.id = :userId1)
            order by m.fechaEnvio asc
            """)
    List<MensajeEntity> findConversacion(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    @Query("""
            select distinct case
                when m.remitente.id = :userId then m.destinatario.id
                else m.remitente.id
            end
            from MensajeEntity m
            where m.remitente.id = :userId or m.destinatario.id = :userId
            """)
    List<Long> findContactosIds(@Param("userId") Long userId);

    long countByDestinatarioIdAndLeidoFalse(Long destinatarioId);
}
