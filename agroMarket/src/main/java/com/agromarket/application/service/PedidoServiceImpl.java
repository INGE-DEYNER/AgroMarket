package com.agromarket.application.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

import com.agromarket.application.dto.CrearPedidoRequest;
import com.agromarket.application.dto.PedidoResponse;
import com.agromarket.application.mapper.PedidoMapper;
import com.agromarket.domain.exception.AccesoDenegadoException;
import com.agromarket.domain.exception.EstadoPedidoInvalidoException;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.domain.exception.StockInsuficienteException;
import com.agromarket.domain.model.EstadoEnvio;
import com.agromarket.domain.model.EstadoPedido;
import com.agromarket.domain.model.RolUsuario;
import com.agromarket.infrastructure.persistence.entity.CompradorEntity;
import com.agromarket.infrastructure.persistence.entity.EnvioEntity;
import com.agromarket.infrastructure.persistence.entity.PedidoEntity;
import com.agromarket.infrastructure.persistence.entity.ProductoEntity;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.EnvioJpaRepository;
import com.agromarket.infrastructure.persistence.repository.PedidoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.ProductoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.github.benmanes.caffeine.cache.Cache;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PedidoServiceImpl implements PedidoService {
    private final PedidoJpaRepository pedidoJpaRepository;
    private final ProductoJpaRepository productoJpaRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final EnvioJpaRepository envioJpaRepository;
    private final PedidoMapper pedidoMapper;
    private final Cache<Long, Object> pedidosCache;

    @Override
    public PedidoResponse crear(CrearPedidoRequest request, Long compradorId) {
        CompradorEntity comprador = obtenerComprador(compradorId);
        ProductoEntity producto = obtenerProducto(request.getProductoId());
        if (producto.getProductor() != null && producto.getProductor().getId() != null && producto.getProductor().getId().equals(compradorId)) {
            throw new AccesoDenegadoException("Un comprador no puede comprar su propio producto");
        }
        try {
            if (producto.getCantidadDisponible() == null || producto.getCantidadDisponible() < request.getCantidad()) {
                throw new StockInsuficienteException("Stock insuficiente para crear el pedido");
            }
            producto.setCantidadDisponible(producto.getCantidadDisponible() - request.getCantidad());
            productoJpaRepository.save(producto);
        } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {
            throw new StockInsuficienteException("Producto agotado, intente de nuevo");
        }

        PedidoEntity pedido = PedidoEntity.builder()
                .comprador(comprador)
                .producto(producto)
                .cantidad(request.getCantidad())
                .precioUnitario(producto.getPrecio())
                .total(producto.getPrecio().multiply(java.math.BigDecimal.valueOf(request.getCantidad())))
                .estado(EstadoPedido.PENDIENTE)
                .build();
        PedidoEntity guardado = pedidoJpaRepository.save(pedido);
        // invalidate caches
        pedidosCache.invalidateAll();
        return pedidoMapper.toResponse(guardado);
    }

    @Override
    public List<PedidoResponse> getMisCompras(Long compradorId) {
        return pedidoMapper.toResponseList(pedidoJpaRepository.findByCompradorId(compradorId));
    }

    @Override
    public List<PedidoResponse> getMisVentas(Long productorId) {
        return pedidoMapper.toResponseList(pedidoJpaRepository.findByProductoProductorId(productorId));
    }

    @Override
    public List<PedidoResponse> getAll() {
        return pedidoMapper.toResponseList(pedidoJpaRepository.findAll());
    }

    @Override
    public PedidoResponse avanzarEstado(Long pedidoId, Long solicitanteId) {
        PedidoEntity pedido = obtenerPedido(pedidoId);
        UsuarioEntity solicitante = obtenerUsuario(solicitanteId);
        boolean esAdmin = solicitante.getRol() == RolUsuario.ADMINISTRADOR;
        boolean esDueno = pedido.getProducto() != null && pedido.getProducto().getProductor() != null && pedido.getProducto().getProductor().getId() != null && pedido.getProducto().getProductor().getId().equals(solicitanteId);
        if (!esAdmin && !esDueno) {
            throw new AccesoDenegadoException("No tiene permisos para avanzar este pedido");
        }
        if (pedido.getEstado() == EstadoPedido.CANCELADO || pedido.getEstado() == EstadoPedido.ENTREGADO) {
            throw new EstadoPedidoInvalidoException("El pedido no puede avanzar desde el estado actual");
        }
        if (pedido.getEstado() == EstadoPedido.PENDIENTE) {
            pedido.setEstado(EstadoPedido.ENVIADO);
            if (envioJpaRepository.findByPedidoId(pedidoId).isEmpty()) {
                EnvioEntity envio = EnvioEntity.builder()
                        .pedido(pedido)
                        .direccionDestino("Por definir")
                        .estado(EstadoEnvio.PREPARANDO)
                        .origen("Chigorodó, Antioquia")
                        .fechaEstimadaEntrega(LocalDate.now().plusDays(2))
                        .build();
                envioJpaRepository.save(envio);
            }
        } else if (pedido.getEstado() == EstadoPedido.ENVIADO) {
            pedido.setEstado(EstadoPedido.ENTREGADO);
        }
        PedidoResponse result = pedidoMapper.toResponse(pedidoJpaRepository.save(pedido));
        // invalidate caches
        pedidosCache.invalidateAll();
        return result;
    }

    @Override
    public void cancelar(Long pedidoId, Long compradorId) {
        PedidoEntity pedido = obtenerPedido(pedidoId);
        UsuarioEntity solicitante = obtenerUsuario(compradorId);
        boolean esAdmin = solicitante.getRol() == RolUsuario.ADMINISTRADOR;
        boolean esDueno = pedido.getComprador() != null && pedido.getComprador().getId() != null && pedido.getComprador().getId().equals(compradorId);
        if (!esAdmin && !esDueno) {
            throw new AccesoDenegadoException("No tiene permisos para cancelar este pedido");
        }
        if (pedido.getEstado() != EstadoPedido.PENDIENTE) {
            throw new EstadoPedidoInvalidoException("Solo se puede cancelar un pedido pendiente");
        }
        pedido.setEstado(EstadoPedido.CANCELADO);
        ProductoEntity producto = pedido.getProducto();
        producto.setCantidadDisponible(producto.getCantidadDisponible() + pedido.getCantidad());
        productoJpaRepository.save(producto);
        pedidoJpaRepository.save(pedido);
        // invalidate caches
        pedidosCache.invalidateAll();
    }

    @Override
    public PedidoResponse getById(Long pedidoId, Long solicitanteId) {
        PedidoEntity pedido = obtenerPedido(pedidoId);
        UsuarioEntity solicitante = obtenerUsuario(solicitanteId);
        boolean esAdmin = solicitante.getRol() == RolUsuario.ADMINISTRADOR;
        boolean esComprador = pedido.getComprador() != null && pedido.getComprador().getId() != null && pedido.getComprador().getId().equals(solicitanteId);
        boolean esProductor = pedido.getProducto() != null && pedido.getProducto().getProductor() != null && pedido.getProducto().getProductor().getId() != null && pedido.getProducto().getProductor().getId().equals(solicitanteId);
        if (!esAdmin && !esComprador && !esProductor) {
            throw new AccesoDenegadoException("No tiene acceso a este pedido");
        }
        return pedidoMapper.toResponse(pedido);
    }

    private CompradorEntity obtenerComprador(Long compradorId) {
        UsuarioEntity usuario = obtenerUsuario(compradorId);
        if (!(usuario instanceof CompradorEntity comprador)) {
            throw new RecursoNoEncontradoException("El usuario no es un comprador");
        }
        return comprador;
    }

    private UsuarioEntity obtenerUsuario(Long id) {
        return usuarioJpaRepository.findById(Objects.requireNonNull(id, "id"))
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
    }

    private ProductoEntity obtenerProducto(Long id) {
        return productoJpaRepository.findById(Objects.requireNonNull(id, "id"))
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado"));
    }

    private PedidoEntity obtenerPedido(Long id) {
        return pedidoJpaRepository.findById(Objects.requireNonNull(id, "id"))
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado"));
    }
}
