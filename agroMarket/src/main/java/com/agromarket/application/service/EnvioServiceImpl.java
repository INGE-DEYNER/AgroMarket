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
        boolean esComprador = envio.getPedido() != null && envio.getPedido().getComprador() != null && envio.getPedido().getComprador().getId() != null && envio.getPedido().getComprador().getId().equals(solicitanteId);
        boolean esProductor = envio.getPedido() != null && envio.getPedido().getProducto() != null && envio.getPedido().getProducto().getProductor() != null && envio.getPedido().getProducto().getProductor().getId() != null && envio.getPedido().getProducto().getProductor().getId().equals(solicitanteId);
        if (!esAdmin && !esComprador && !esProductor) {
            throw new AccesoDenegadoException("No tiene permisos para ver este envío");
        }
    }

    @Override
    public int calcularDiasEntrega(String ciudadOrigen, String ciudadDestino) {
        if (ciudadOrigen == null || ciudadDestino == null) {
            return 3;
        }
        String orig = ciudadOrigen.toLowerCase().trim();
        String dest = ciudadDestino.toLowerCase().trim();
        if (orig.equals(dest)) {
            return 1; // MISMO_MUNICIPIO
        }
        boolean origAntioquia = orig.contains("antioquia") || orig.contains("chigorodó") || orig.contains("apartadó") || orig.contains("turbo") || orig.contains("carepa");
        boolean destAntioquia = dest.contains("antioquia") || dest.contains("medellín") || dest.contains("envigado") || dest.contains("sabaneta") || dest.contains("bello") || dest.contains("rionegro");
        
        if (origAntioquia && destAntioquia) {
            return 2; // MISMO_DEPARTAMENTO
        }
        
        boolean destCaribe = dest.contains("cartagena") || dest.contains("barranquilla") || dest.contains("santa marta") || dest.contains("montería") || dest.contains("sincelejo") || dest.contains("bolívar") || dest.contains("atlántico") || dest.contains("magdalena") || dest.contains("córdoba") || dest.contains("sucre");
        if (destCaribe) {
            return 2; // COSTA_CARIBE
        }
        
        boolean destCercano = dest.contains("bogotá") || dest.contains("cali") || dest.contains("valle del cauca") || dest.contains("cundinamarca");
        if (destCercano) {
            return 3; // DEPARTAMENTO_CERCANO
        }
        
        return 4; // OTRO_DEPARTAMENTO
    }
}
