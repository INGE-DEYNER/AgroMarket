package com.agromarket.domain.ports;

import java.util.List;
import java.util.Optional;

import com.agromarket.domain.models.Pedido;
import com.agromarket.domain.models.enums.EstadoPedido;

public interface PedidoRepository {
    List<Pedido> findByCompradorId(Long compradorId);

    List<Pedido> findByProductoProductorId(Long productorId);

    List<Pedido> findByEstado(EstadoPedido estado);

    Optional<Pedido> findById(Long id);

    Pedido save(Pedido pedido);
}
