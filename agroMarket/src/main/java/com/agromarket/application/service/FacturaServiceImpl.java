package com.agromarket.application.service;

import com.agromarket.application.dto.FacturaResponse;
import com.agromarket.application.mapper.FacturaMapper;
import com.agromarket.domain.exception.AccesoDenegadoException;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.infrastructure.persistence.entity.FacturaEntity;
import com.agromarket.infrastructure.persistence.entity.PedidoEntity;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.FacturaJpaRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;
import com.agromarket.domain.model.RolUsuario;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FacturaServiceImpl implements FacturaService {
    private final FacturaJpaRepository facturaJpaRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final FacturaMapper facturaMapper;

    @Override
    public FacturaResponse getByPedidoId(Long pedidoId, Long solicitanteId) {
        FacturaEntity factura = facturaJpaRepository.findByPedidoId(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Factura no encontrada"));
        validarPropietario(factura.getPedido(), solicitanteId);
        return facturaMapper.toResponse(factura);
    }

    @Override
    public FacturaResponse getById(Long id, Long solicitanteId) {
        FacturaEntity factura = facturaJpaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Factura no encontrada"));
        validarPropietario(factura.getPedido(), solicitanteId);
        return facturaMapper.toResponse(factura);
    }

    private void validarPropietario(PedidoEntity pedido, Long solicitanteId) {
        UsuarioEntity usuario = usuarioJpaRepository.findById(solicitanteId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        boolean esAdmin = usuario.getRol() == RolUsuario.ADMINISTRADOR;
        boolean esDueno = pedido != null && pedido.getComprador() != null && pedido.getComprador().getId() != null && pedido.getComprador().getId().equals(solicitanteId);
        if (!esAdmin && !esDueno) {
            throw new AccesoDenegadoException("No tiene permisos para ver esta factura");
        }
    }
}
