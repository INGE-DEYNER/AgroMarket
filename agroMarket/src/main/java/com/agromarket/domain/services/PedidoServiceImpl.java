package com.agromarket.domain.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

import com.agromarket.application.api.request.CrearPedidoRequest;
import com.agromarket.application.api.response.PedidoResponse;
import com.agromarket.application.mapper.PedidoMapper;
import com.agromarket.application.persistence.sql.entities.CompradorEntity;
import com.agromarket.application.persistence.sql.entities.EnvioEntity;
import com.agromarket.application.persistence.sql.entities.PedidoEntity;
import com.agromarket.application.persistence.sql.entities.ProductoEntity;
import com.agromarket.application.persistence.sql.entities.UsuarioEntity;
import com.agromarket.application.persistence.sql.repositories.EnvioJpaRepository;
import com.agromarket.application.persistence.sql.repositories.PedidoJpaRepository;
import com.agromarket.application.persistence.sql.repositories.ProductoJpaRepository;
import com.agromarket.application.persistence.sql.repositories.UsuarioJpaRepository;
import com.agromarket.domain.exception.AccesoDenegadoException;
import com.agromarket.domain.exception.EstadoPedidoInvalidoException;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.domain.exception.StockInsuficienteException;
import com.agromarket.domain.models.enums.EstadoEnvio;
import com.agromarket.domain.models.enums.EstadoPedido;
import com.agromarket.domain.models.enums.RolUsuario;
import com.agromarket.domain.ports.PedidoService;

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
                .checkoutId(request.getCheckoutId())
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
                String destino = pedido.getComprador() != null ? pedido.getComprador().getUbicacion() : "Medellín, Antioquia";
                if (destino == null || destino.isBlank()) {
                    destino = "Medellín, Antioquia";
                }
                int dias = calcularDiasEntregaSimple("Chigorodó, Antioquia", destino);
                EnvioEntity envio = EnvioEntity.builder()
                        .pedido(pedido)
                        .direccionDestino(destino)
                        .estado(EstadoEnvio.PREPARANDO)
                        .origen("Chigorodó, Antioquia")
                        .fechaEstimadaEntrega(LocalDate.now().plusDays(dias))
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

    private int calcularDiasEntregaSimple(String ciudadOrigen, String ciudadDestino) {
        if (ciudadOrigen == null || ciudadDestino == null) {
            return 3;
        }
        String orig = ciudadOrigen.toLowerCase().trim();
        String dest = ciudadDestino.toLowerCase().trim();
        if (orig.equals(dest)) {
            return 1;
        }
        boolean origAntioquia = orig.contains("antioquia") || orig.contains("chigorodó") || orig.contains("apartadó") || orig.contains("turbo") || orig.contains("carepa");
        boolean destAntioquia = dest.contains("antioquia") || dest.contains("medellín") || dest.contains("envigado") || dest.contains("sabaneta") || dest.contains("bello") || dest.contains("rionegro");
        
        if (origAntioquia && destAntioquia) {
            return 2;
        }
        boolean destCaribe = dest.contains("cartagena") || dest.contains("barranquilla") || dest.contains("santa marta") || dest.contains("montería") || dest.contains("sincelejo") || dest.contains("bolívar") || dest.contains("atlántico") || dest.contains("magdalena") || dest.contains("córdoba") || dest.contains("sucre");
        if (destCaribe) {
            return 2;
        }
        boolean destCercano = dest.contains("bogotá") || dest.contains("cali") || dest.contains("valle del cauca") || dest.contains("cundinamarca");
        if (destCercano) {
            return 3;
        }
        return 4;
    }
}
