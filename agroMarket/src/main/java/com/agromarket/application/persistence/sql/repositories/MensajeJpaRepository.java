package com.agromarket.application.persistence.sql.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.agromarket.application.persistence.sql.entities.MensajeEntity;

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

    long countByDestinatarioIdAndRemitenteIdAndLeidoFalse(Long destinatarioId, Long remitenteId);

    @Query(value = """
            select * from mensajes
            where (remitente_id = :userId1 and destinatario_id = :userId2)
               or (remitente_id = :userId2 and destinatario_id = :userId1)
            order by fecha_envio desc limit 1
            """, nativeQuery = true)
    MensajeEntity findUltimoMensaje(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
