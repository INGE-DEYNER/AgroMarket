package com.agromarket.infrastructure.persistence.repository;

import java.util.List;

import com.agromarket.infrastructure.persistence.entity.ResenaEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ResenaJpaRepository extends JpaRepository<ResenaEntity, Long> {
    List<ResenaEntity> findByProductoId(Long productoId);

    boolean existsByCompradorIdAndProductoId(Long compradorId, Long productoId);

    @Query("""
            select case when count(p) > 0 then true else false end
            from PedidoEntity p
            where p.comprador.id = :compradorId
              and p.producto.id = :productoId
              and p.estado = com.agromarket.domain.model.EstadoPedido.ENTREGADO
            """)
    boolean tieneEntregado(@Param("compradorId") Long compradorId, @Param("productoId") Long productoId);
}
