package com.agromarket.application.service;

import java.util.List;

import com.agromarket.application.dto.ActualizarEnvioRequest;
import com.agromarket.application.dto.EnvioResponse;
import com.agromarket.application.mapper.EnvioMapper;
import com.agromarket.domain.exception.AccesoDenegadoException;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.domain.model.RolUsuario;
import com.agromarket.infrastructure.persistence.entity.EnvioEntity;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.EnvioJpaRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class EnvioServiceImpl implements EnvioService {
    private final EnvioJpaRepository envioJpaRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final com.agromarket.infrastructure.persistence.repository.PedidoJpaRepository pedidoJpaRepository;
    private final EnvioMapper envioMapper;

    @Override
    public EnvioResponse getByPedidoId(Long pedidoId, Long solicitanteId) {
        EnvioEntity envio = envioJpaRepository.findByPedidoId(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Envío no encontrado"));
        validarPropietario(envio, solicitanteId);
        return envioMapper.toResponse(envio);
    }

    @Override
    public List<EnvioResponse> getMisEnvios(Long compradorId) {
        return envioJpaRepository.findByPedidoCompradorId(compradorId).stream().map(envioMapper::toResponse).toList();
    }

    @Override
    public List<EnvioResponse> getMisDespachos(Long productorId) {
        return envioJpaRepository.findByPedidoProductoProductorId(productorId).stream().map(envioMapper::toResponse).toList();
    }

    @Override
    public EnvioResponse actualizar(Long id, ActualizarEnvioRequest request, Long productorId) {
        EnvioEntity envio = envioJpaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Envío no encontrado"));
        UsuarioEntity solicitante = usuarioJpaRepository.findById(productorId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        boolean esAdmin = solicitante.getRol() == RolUsuario.ADMINISTRADOR;
        boolean esDueno = envio.getPedido() != null && envio.getPedido().getProducto() != null && envio.getPedido().getProducto().getProductor() != null && envio.getPedido().getProducto().getProductor().getId() != null && envio.getPedido().getProducto().getProductor().getId().equals(productorId);
        if (!esAdmin && !esDueno) {
            throw new AccesoDenegadoException("No tiene permisos para actualizar este envío");
        }
        if (request.getTransportista() != null) {
            envio.setTransportista(request.getTransportista());
        }
        if (request.getGuia() != null) {
            envio.setGuia(request.getGuia());
        }
        if (request.getFechaEstimadaEntrega() != null) {
            envio.setFechaEstimadaEntrega(request.getFechaEstimadaEntrega());
        }
        if (request.getEstado() != null) {
            envio.setEstado(request.getEstado());
            if (envio.getPedido() != null) {
                com.agromarket.infrastructure.persistence.entity.PedidoEntity pedido = envio.getPedido();
                if (request.getEstado() == com.agromarket.domain.model.EstadoEnvio.EN_CAMINO) {
                    pedido.setEstado(com.agromarket.domain.model.EstadoPedido.ENVIADO);
                } else if (request.getEstado() == com.agromarket.domain.model.EstadoEnvio.ENTREGADO) {
                    pedido.setEstado(com.agromarket.domain.model.EstadoPedido.ENTREGADO);
                }
                pedidoJpaRepository.save(pedido);
            }
        }
        return envioMapper.toResponse(envioJpaRepository.save(envio));
    }

    private void validarPropietario(EnvioEntity envio, Long solicitanteId) {
        UsuarioEntity solicitante = usuarioJpaRepository.findById(solicitanteId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        boolean esAdmin = solicitante.getRol() == RolUsuario.ADMINISTRADOR;
        boolean esDueno = envio.getPedido() != null && envio.getPedido().getComprador() != null && envio.getPedido().getComprador().getId() != null && envio.getPedido().getComprador().getId().equals(solicitanteId);
        if (!esAdmin && !esDueno) {
            throw new AccesoDenegadoException("No tiene permisos para ver este envío");
        }
    }
}
