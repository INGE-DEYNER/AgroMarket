package com.agromarket.domain.repository;

import java.util.List;
import java.util.Optional;

import com.agromarket.domain.model.EstadoPedido;
import com.agromarket.domain.model.Pedido;

public interface PedidoRepository {
    List<Pedido> findByCompradorId(Long compradorId);

    List<Pedido> findByProductoProductorId(Long productorId);

    List<Pedido> findByEstado(EstadoPedido estado);

    Optional<Pedido> findById(Long id);

    Pedido save(Pedido pedido);
}
