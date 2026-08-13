package com.agromarket.application.usecases;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

import com.agromarket.interfaces.rest.request.CrearPedidoRequest;
import com.agromarket.interfaces.rest.response.PedidoResponse;
import com.agromarket.infrastructure.persistence.mapper.PedidoMapper;
import com.agromarket.domain.models.Comprador;
import com.agromarket.domain.models.Envio;
import com.agromarket.domain.models.Pedido;
import com.agromarket.domain.models.Producto;
import com.agromarket.domain.models.Usuario;
import com.agromarket.domain.ports.out.DeliveryRepositoryPort;
import com.agromarket.domain.ports.out.OrderRepositoryPort;
import com.agromarket.domain.ports.out.ProductRepositoryPort;
import com.agromarket.domain.ports.out.UserRepositoryPort;
import com.agromarket.domain.exception.AccesoDenegadoException;
import com.agromarket.domain.exception.EstadoPedidoInvalidoException;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.domain.exception.StockInsuficienteException;
import com.agromarket.domain.models.enums.EstadoEnvio;
import com.agromarket.domain.models.enums.EstadoPedido;
import com.agromarket.domain.models.enums.RolUsuario;
import com.agromarket.application.ports.in.PedidoService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.github.benmanes.caffeine.cache.Cache;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PedidoServiceImpl implements PedidoService {
    private final OrderRepositoryPort orderRepositoryPort;
    private final ProductRepositoryPort productRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;
    private final DeliveryRepositoryPort deliveryRepositoryPort;
    private final PedidoMapper pedidoMapper;
    private final Cache<Long, Object> pedidosCache;

    @Override
    public PedidoResponse crear(CrearPedidoRequest request, Long compradorId) {
        Comprador comprador = obtenerComprador(compradorId);
        Producto producto = obtenerProducto(request.getProductoId());
        
        if (producto.getProductor() != null && producto.getProductor().getId() != null && producto.getProductor().getId().equals(compradorId)) {
            throw new AccesoDenegadoException("Un comprador no puede comprar su propio producto");
        }
        
        try {
            producto.decrementarStock(request.getCantidad());
            productRepositoryPort.save(producto);
        } catch (IllegalArgumentException e) {
            throw new StockInsuficienteException("Stock insuficiente para crear el pedido");
        }

        Pedido pedido = Pedido.builder()
                .comprador(comprador)
                .producto(producto)
                .cantidad(request.getCantidad())
                .precioUnitario(producto.getPrecio())
                .total(producto.getPrecio().multiply(java.math.BigDecimal.valueOf(request.getCantidad())))
                .estado(EstadoPedido.PENDIENTE)
                .checkoutId(request.getCheckoutId())
                .build();
                
        Pedido guardado = orderRepositoryPort.save(pedido);
        // invalidate caches
        pedidosCache.invalidateAll();
        return pedidoMapper.toResponse(guardado);
    }

    @Override
    public List<PedidoResponse> getMisCompras(Long compradorId) {
        return pedidoMapper.toResponseList(orderRepositoryPort.findByBuyerId(compradorId));
    }

    @Override
    public List<PedidoResponse> getMisVentas(Long productorId) {
        return pedidoMapper.toResponseList(orderRepositoryPort.findByProducerId(productorId));
    }

    @Override
    public List<PedidoResponse> getAll() {
        return pedidoMapper.toResponseList(orderRepositoryPort.findAll());
    }

    @Override
    public PedidoResponse avanzarEstado(Long pedidoId, Long solicitanteId) {
        Pedido pedido = obtenerPedido(pedidoId);
        Usuario solicitante = obtenerUsuario(solicitanteId);
        
        boolean esAdmin = solicitante.getRol() == RolUsuario.ADMINISTRADOR;
        boolean esDueno = pedido.getProducto() != null && pedido.getProducto().getProductor() != null && pedido.getProducto().getProductor().getId() != null && pedido.getProducto().getProductor().getId().equals(solicitanteId);
        
        if (!esAdmin && !esDueno) {
            throw new AccesoDenegadoException("No tiene permisos para avanzar este pedido");
        }
        if (pedido.getEstado() == EstadoPedido.CANCELADO || pedido.getEstado() == EstadoPedido.ENTREGADO) {
            throw new EstadoPedidoInvalidoException("El pedido no puede avanzar desde el estado actual");
        }
        if (pedido.getEstado() == EstadoPedido.PENDIENTE) {
            pedido.avanzarEstado(); // Avanza a ENVIADO
            
            if (deliveryRepositoryPort.findByOrderId(pedidoId).isEmpty()) {
                String destino = pedido.getComprador() != null ? pedido.getComprador().getUbicacion() : "Medellín, Antioquia";
                if (destino == null || destino.isBlank()) {
                    destino = "Medellín, Antioquia";
                }
                int dias = calcularDiasEntregaSimple("Chigorodó, Antioquia", destino);
                Envio envio = Envio.builder()
                        .pedido(pedido)
                        .direccionDestino(destino)
                        .estado(EstadoEnvio.PREPARANDO)
                        .origen("Chigorodó, Antioquia")
                        .fechaEstimadaEntrega(LocalDate.now().plusDays(dias))
                        .build();
                deliveryRepositoryPort.save(envio);
            }
        } else if (pedido.getEstado() == EstadoPedido.ENVIADO) {
            pedido.avanzarEstado(); // Avanza a ENTREGADO
        }
        
        PedidoResponse result = pedidoMapper.toResponse(orderRepositoryPort.save(pedido));
        // invalidate caches
        pedidosCache.invalidateAll();
        return result;
    }

    @Override
    public void cancelar(Long pedidoId, Long compradorId) {
        Pedido pedido = obtenerPedido(pedidoId);
        Usuario solicitante = obtenerUsuario(compradorId);
        
        boolean esAdmin = solicitante.getRol() == RolUsuario.ADMINISTRADOR;
        boolean esDueno = pedido.getComprador() != null && pedido.getComprador().getId() != null && pedido.getComprador().getId().equals(compradorId);
        
        if (!esAdmin && !esDueno) {
            throw new AccesoDenegadoException("No tiene permisos para cancelar este pedido");
        }
        
        pedido.cancelar();
        Producto producto = pedido.getProducto();
        // Return stock
        producto.setCantidadDisponible(producto.getCantidadDisponible() + pedido.getCantidad());
        
        productRepositoryPort.save(producto);
        orderRepositoryPort.save(pedido);
        
        // invalidate caches
        pedidosCache.invalidateAll();
    }

    @Override
    public PedidoResponse getById(Long pedidoId, Long solicitanteId) {
        Pedido pedido = obtenerPedido(pedidoId);
        Usuario solicitante = obtenerUsuario(solicitanteId);
        
        boolean esAdmin = solicitante.getRol() == RolUsuario.ADMINISTRADOR;
        boolean esComprador = pedido.getComprador() != null && pedido.getComprador().getId() != null && pedido.getComprador().getId().equals(solicitanteId);
        boolean esProductor = pedido.getProducto() != null && pedido.getProducto().getProductor() != null && pedido.getProducto().getProductor().getId() != null && pedido.getProducto().getProductor().getId().equals(solicitanteId);
        
        if (!esAdmin && !esComprador && !esProductor) {
            throw new AccesoDenegadoException("No tiene acceso a este pedido");
        }
        return pedidoMapper.toResponse(pedido);
    }

    private Comprador obtenerComprador(Long compradorId) {
        Usuario usuario = obtenerUsuario(compradorId);
        if (!(usuario instanceof Comprador comprador)) {
            throw new RecursoNoEncontradoException("El usuario no es un comprador");
        }
        return comprador;
    }

    private Usuario obtenerUsuario(Long id) {
        return userRepositoryPort.findById(Objects.requireNonNull(id, "id"))
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
    }

    private Producto obtenerProducto(Long id) {
        return productRepositoryPort.findById(Objects.requireNonNull(id, "id"))
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado"));
    }

    private Pedido obtenerPedido(Long id) {
        return orderRepositoryPort.findById(Objects.requireNonNull(id, "id"))
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
