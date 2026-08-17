package com.agromarket.application.usecases.order;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.agromarket.domain.exceptions.order.OrderNotFoundException;
import com.agromarket.domain.models.enums.order.OrderState;
import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.ports.in.order.CreateOrderCommand;
import com.agromarket.domain.ports.in.order.OrderPort;
import com.agromarket.domain.ports.in.order.OrderResult;
import com.agromarket.domain.ports.out.product.ProductPort;
import com.agromarket.domain.ports.out.user.UserPort;
import com.agromarket.domain.services.order.OrderService;
import com.agromarket.domain.services.product.ProductService;
import com.agromarket.domain.services.product.ProductStockService;

/**
 * Casos de uso del agregado Order.
 */
@Service
@Transactional
public class OrderUseCase implements OrderPort {
    private final com.agromarket.domain.ports.out.order.OrderPort orderPort;
    private final ProductPort productPort;
    private final UserPort userPort;
    private final OrderService orderService;
    private final ProductService productService;
    private final ProductStockService productStockService;

    public OrderUseCase(
            com.agromarket.domain.ports.out.order.OrderPort orderPort,
            ProductPort productPort,
            UserPort userPort,
            OrderService orderService,
            ProductService productService,
            ProductStockService productStockService) {
        this.orderPort = orderPort;
        this.productPort = productPort;
        this.userPort = userPort;
        this.orderService = orderService;
        this.productService = productService;
        this.productStockService = productStockService;
    }

    @Override
    public OrderResult createOrder(CreateOrderCommand command) {
        Objects.requireNonNull(command, "El comando es obligatorio");
        User buyer = userPort.findById(command.getBuyerId())
                .orElseThrow(() -> new IllegalArgumentException("El comprador no existe"));
        if (buyer.getRole() != Role.BUYER) {
            throw new IllegalArgumentException("El usuario no tiene rol BUYER");
        }
        Product product = productPort.findById(command.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("El producto no existe"));
        if (!productService.isAvailable(product) ||
                !productService.hasEnoughStock(product, command.getQuantity())) {
            throw new IllegalArgumentException("El producto no tiene disponibilidad suficiente");
        }

        var unitPrice = productService.getEffectivePrice(product);
        productStockService.decrease(product, command.getQuantity());
        productPort.save(product);

        Order order = Order.builder()
                .buyer(buyer)
                .product(product)
                .quantity(command.getQuantity())
                .unitPrice(unitPrice)
                .state(OrderState.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        order.setTotal(orderService.calculateTotal(order));
        return toResult(orderPort.save(order));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResult getOrderById(Long id) {
        return toResult(findOrder(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResult> getAllOrders() {
        return orderPort.findAll().stream().map(this::toResult).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResult> getOrdersByBuyer(Long buyerId) {
        return orderPort.findByBuyerId(buyerId).stream().map(this::toResult).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResult> getOrdersByProducer(Long producerId) {
        return orderPort.findByProducerId(producerId).stream().map(this::toResult).collect(Collectors.toList());
    }

    @Override
    public void advanceOrderState(Long orderId) {
        Order order = findOrder(orderId);
        if (!orderService.canAdvance(order)) {
            throw new IllegalStateException("El pedido no puede avanzar desde su estado actual");
        }
        order.setState(orderService.nextState(order));
        orderPort.save(order);
    }

    @Override
    public void cancelOrder(Long orderId) {
        Order order = findOrder(orderId);
        if (!orderService.canCancel(order)) {
            throw new IllegalStateException("El pedido no puede cancelarse");
        }
        order.cancel();
        if (order.getProduct() != null && order.getQuantity() != null) {
            Product product = productPort.findById(order.getProduct().getId())
                    .orElseThrow(() -> new IllegalArgumentException("El producto asociado no existe"));
            productStockService.increase(product, order.getQuantity());
            productPort.save(product);
        }
        orderPort.save(order);
    }

    @Override
    public void deleteOrder(Long id) {
        Order order = findOrder(id);
        orderPort.deleteById(order);
    }

    private Order findOrder(Long id) {
        return orderPort.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Pedido no encontrado: " + id));
    }

    private OrderResult toResult(Order order) {
        return OrderResult.builder()
                .id(order.getId())
                .buyer(order.getBuyer())
                .product(order.getProduct())
                .quantity(order.getQuantity())
                .unitPrice(order.getUnitPrice())
                .total(order.getTotal())
                .state(order.getState())
                .createdAt(order.getCreatedAt())
                .checkoutId(order.getCheckoutId())
                .build();
    }
}
