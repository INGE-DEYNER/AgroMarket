package com.agromarket.application.adapters.api.controllers.order;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.agromarket.application.adapters.api.request.order.CreateOrderRequest;
import com.agromarket.application.adapters.api.response.order.BuyerSummaryResponse;
import com.agromarket.application.adapters.api.response.order.OrderResponse;
import com.agromarket.application.adapters.api.response.order.ProductSummaryResponse;
import com.agromarket.domain.ports.in.order.*;
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
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(toResponse(orderPort.createOrder(
                CreateOrderCommand.builder().buyerId(request.getBuyerId()).productId(request.getProductId())
                        .quantity(request.getQuantity()).build())));
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
                .createdAt(r.getCreatedAt()).checkoutId(r.getCheckoutId()).build();
    }
}
