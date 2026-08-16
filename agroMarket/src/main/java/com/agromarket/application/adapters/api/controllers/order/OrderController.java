package com.agromarket.application.adapters.api.controllers.order;

import java.util.List;
import java.util.stream.Collectors;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.agromarket.application.adapters.api.request.payment.CreateOrderRequest;
import com.agromarket.application.adapters.api.response.payment.*;
import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.ports.in.order.*;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.models.user.User;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
    private final OrderPort orderPort;

    public OrderController(OrderPort orderPort) {
        this.orderPort = orderPort;
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
