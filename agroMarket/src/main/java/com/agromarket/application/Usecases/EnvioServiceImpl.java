package com.agromarket.application.usecases;

import java.util.List;

import com.agromarket.application.usecases.DeliveryCalculatorService;
import com.agromarket.interfaces.rest.request.ActualizarEnvioRequest;
import com.agromarket.interfaces.rest.response.EnvioResponse;
import com.agromarket.infrastructure.persistence.mapper.EnvioMapper;
import com.agromarket.domain.models.Envio;
import com.agromarket.domain.models.Pedido;
import com.agromarket.domain.models.Usuario;
import com.agromarket.domain.ports.out.DeliveryRepositoryPort;
import com.agromarket.domain.ports.out.OrderRepositoryPort;
import com.agromarket.domain.ports.out.UserRepositoryPort;
import com.agromarket.domain.exception.AccesoDenegadoException;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.domain.models.enums.RolUsuario;
import com.agromarket.application.ports.in.EnvioService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class EnvioServiceImpl implements EnvioService {
    private final DeliveryRepositoryPort deliveryRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;
    private final OrderRepositoryPort orderRepositoryPort;
    private final EnvioMapper envioMapper;
    private final DeliveryCalculatorService deliveryCalculatorService;

    @Override
    public EnvioResponse getByPedidoId(Long pedidoId, Long solicitanteId) {
        List<Envio> envios = deliveryRepositoryPort.findByOrderId(pedidoId);
        if (envios.isEmpty()) {
            throw new RecursoNoEncontradoException("Envío no encontrado");
        }
        Envio envio = envios.get(0);
        validarPropietario(envio, solicitanteId);
        return envioMapper.toResponse(envio);
    }

    @Override
    public List<EnvioResponse> getMisEnvios(Long compradorId) {
        return envioMapper.toResponseList(deliveryRepositoryPort.findByBuyerId(compradorId));
    }

    @Override
    public List<EnvioResponse> getMisDespachos(Long productorId) {
        return envioMapper.toResponseList(deliveryRepositoryPort.findByProducerId(productorId));
    }

    @Override
    public EnvioResponse actualizar(Long id, ActualizarEnvioRequest request, Long productorId) {
        Envio envio = deliveryRepositoryPort.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Envío no encontrado"));
        Usuario solicitante = userRepositoryPort.findById(productorId)
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
                Pedido pedido = envio.getPedido();
                if (request.getEstado() == com.agromarket.domain.models.enums.EstadoEnvio.EN_CAMINO) {
                    pedido.setEstado(com.agromarket.domain.models.enums.EstadoPedido.ENVIADO);
                } else if (request.getEstado() == com.agromarket.domain.models.enums.EstadoEnvio.ENTREGADO) {
                    pedido.setEstado(com.agromarket.domain.models.enums.EstadoPedido.ENTREGADO);
                }
                orderRepositoryPort.save(pedido);
            }
        }
        return envioMapper.toResponse(deliveryRepositoryPort.save(envio));
    }

    private void validarPropietario(Envio envio, Long solicitanteId) {
        Usuario solicitante = userRepositoryPort.findById(solicitanteId)
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
        return deliveryCalculatorService.calcularDias(ciudadDestino);
    }
}
