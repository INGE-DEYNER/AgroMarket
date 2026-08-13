package com.agromarket.application.usecases;

import com.agromarket.domain.exception.AccesoDenegadoException;
import com.agromarket.domain.exception.ResenaDuplicadaException;
import com.agromarket.domain.models.Resena;
import com.agromarket.application.ports.in.PedidoRepository;
import com.agromarket.application.ports.in.ResenaRepository;

public class ResenaDomainService {
    public void validarCompraEntregada(Long compradorId, Long productoId, ResenaRepository resenaRepository, PedidoRepository pedidoRepository) {
        if (resenaRepository.existsByCompradorIdAndProductoId(compradorId, productoId)) {
            throw new ResenaDuplicadaException("Ya existe una reseña para este producto");
        }
        if (!resenaRepository.tieneEntregado(compradorId, productoId)) {
            throw new AccesoDenegadoException("El comprador debe tener al menos un pedido entregado del producto");
        }
    }

    public void validarResena(Resena resena) {
        if (resena == null || resena.getCalificacion() == null) {
            throw new AccesoDenegadoException("Reseña inválida");
        }
    }
}
