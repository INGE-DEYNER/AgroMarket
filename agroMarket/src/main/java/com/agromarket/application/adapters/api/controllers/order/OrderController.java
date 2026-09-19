package com.agromarket.application.adapters.api.controllers.order;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.agromarket.application.adapters.api.request.order.CreateOrderRequest;
import com.agromarket.application.adapters.api.response.order.BuyerSummaryResponse;
import com.agromarket.application.adapters.api.response.order.OrderResponse;
import com.agromarket.application.adapters.api.response.order.ProductSummaryResponse;
import com.agromarket.domain.ports.in.order.*;
import com.agromarket.domain.models.enums.order.OrderState;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.models.user.User;
import com.agromarket.infrastructure.security.JwtUserPrincipal;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
    private final OrderPort orderPort;

    public OrderController(OrderPort orderPort) {
        this.orderPort = orderPort;
    }

    /**
     * Pedidos del usuario autenticado. Lo consumen el dashboard del
     * comprador, el dashboard del productor y la página de pedidos
     * (GET /api/v1/pedidos/mis-pedidos, reescrito a esta ruta por el
     * ApiPathAliasFilter).
     *
     * CAUSA RAÍZ del error 400 "For input string: mis-pedidos": este
     * endpoint no existía y la petición caía en @GetMapping("/{id}"),
     * que intentaba parsear la palabra "mis-pedidos" como un ID numérico
     * (NumberFormatException). Devuelve los pedidos donde el usuario
     * participa como comprador o como productor, sin duplicados.
     */
    @GetMapping("/mis-pedidos")
    public ResponseEntity<List<OrderResponse>> misPedidos(
            @AuthenticationPrincipal JwtUserPrincipal principal) {

        Long userId = principal.getUserId();

        List<OrderResult> mine = new ArrayList<>(orderPort.getOrdersByBuyer(userId));

        for (OrderResult asProducer : orderPort.getOrdersByProducer(userId)) {
            boolean yaIncluido = mine.stream()
                    .anyMatch(o -> Objects.equals(o.getId(), asProducer.getId()));

            if (!yaIncluido) {
                mine.add(asProducer);
            }
        }

        return ResponseEntity.ok(
                mine.stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<OrderResponse> create(
            @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal JwtUserPrincipal principal) {

        if (principal == null || principal.getUserId() == null) {
            throw new IllegalStateException("La sesión del comprador es obligatoria");
        }

        Long buyerId = principal.getUserId();

        return ResponseEntity.ok(toResponse(orderPort.createOrder(
                CreateOrderCommand.builder()
                        .buyerId(buyerId)
                        .productId(request.getProductId())
                        .quantity(request.getQuantity())
                        .checkoutId(request.getCheckoutId())
                        .originLatitude(request.getOriginLatitude())
                        .originLongitude(request.getOriginLongitude())
                        .destinationLatitude(request.getDestinationLatitude())
                        .destinationLongitude(request.getDestinationLongitude())
                        .build())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(orderPort.getOrderById(id)));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAll() {
        return ResponseEntity.ok(orderPort.getAllOrders().stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<List<OrderResponse>> byBuyer(@PathVariable Long buyerId) {
        return ResponseEntity
                .ok(orderPort.getOrdersByBuyer(buyerId).stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @GetMapping("/producer/{producerId}")
    public ResponseEntity<List<OrderResponse>> byProducer(@PathVariable Long producerId) {
        return ResponseEntity.ok(
                orderPort.getOrdersByProducer(producerId).stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @PatchMapping("/{id}/advance")
    public ResponseEntity<Void> advance(@PathVariable Long id) {
        orderPort.advanceOrderState(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        orderPort.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        orderPort.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PUT /api/v1/orders/{id}/estado (alias frontend: /pedidos/{id}/estado)
     *
     * Permite al productor dueño del pedido (o a un administrador) actualizar
     * el estado del pedido. Mapea etiquetas en español: Aceptado/Enviado ->
     * SHIPPED, Entregado -> DELIVERED, Cancelado -> CANCELLED.
     *
     * CAUSA RAÍZ del alert "Not Found" en el dashboard del productor: este
     * endpoint no existía y el PUT caía en 404.
     */
    @PutMapping("/{id}/estado")
    public ResponseEntity<OrderResponse> updateEstado(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal JwtUserPrincipal principal) {

        Object raw = body == null ? null : body.get("estado");
        OrderState target = mapEstado(raw == null ? "" : String.valueOf(raw));

        OrderResult current = orderPort.getOrderById(id);
        if (current == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Pedido no encontrado: " + id);
        }

        Long producerId = current.getProduct() != null
                && current.getProduct().getProducer() != null
                ? current.getProduct().getProducer().getId()
                : null;

        boolean isAdmin = principal != null && "ADMIN".equals(principal.getRole());
        boolean isOwnerProducer = producerId != null
                && principal != null
                && producerId.equals(principal.getUserId());

        if (!isAdmin && !isOwnerProducer) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(toResponse(orderPort.updateOrderState(id, target)));
    }

    /** Mapea etiquetas de estado (español/inglés, sin acentos) a OrderState. */
    private OrderState mapEstado(String raw) {
        String normalizado = Normalizer
                .normalize(raw.trim().toLowerCase(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");
        return switch (normalizado) {
            case "aceptado", "confirmado", "enviado", "shipped" -> OrderState.SHIPPED;
            case "entregado", "delivered" -> OrderState.DELIVERED;
            case "cancelado", "cancelled", "canceled" -> OrderState.CANCELLED;
            case "pendiente", "pending" -> OrderState.PENDING;
            default -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Estado no válido: " + raw);
        };
    }

    private OrderResponse toResponse(OrderResult r) {
        User b = r.getBuyer();
        Product p = r.getProduct();
        return OrderResponse.builder().id(r.getId())
                .buyer(b == null ? null
                        : BuyerSummaryResponse.builder().id(b.getId())
                                .name((b.getFirstName() == null ? "" : b.getFirstName()) + " "
                                        + (b.getLastName() == null ? "" : b.getLastName()).trim())
                                .email(b.getEmail()).build())
                .product(p == null ? null
                        : ProductSummaryResponse.builder().id(p.getId()).name(p.getName()).unitPrice(r.getUnitPrice())
                                .producerId(p.getProducer() == null ? null : p.getProducer().getId()).build())
                .quantity(r.getQuantity()).unitPrice(r.getUnitPrice()).total(r.getTotal()).state(r.getState())
                .shippingCost(r.getShippingCost())
                .createdAt(r.getCreatedAt()).checkoutId(r.getCheckoutId()).build();
    }
}
