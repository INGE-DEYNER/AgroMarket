package com.agromarket.application.usecases.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.agromarket.domain.exceptions.order.OrderNotFoundException;
import com.agromarket.domain.models.enums.messaging.NotificationType;
import com.agromarket.domain.models.enums.order.OrderState;
import com.agromarket.domain.models.messaging.Notification;
import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.ports.in.order.CreateOrderCommand;
import com.agromarket.domain.ports.in.order.OrderPort;
import com.agromarket.domain.ports.in.order.OrderResult;
import com.agromarket.domain.ports.in.messaging.MessagingPort;
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
    private final com.agromarket.domain.ports.out.config.AppConfigPort appConfigPort;
    private final MessagingPort messagingPort;

    /**
     * Costo de envío nacional configurado (COP). Valor por defecto estático;
     * el valor dinámico vive en la base de datos (app_config) y puede
     * actualizarse desde el panel de administración.
     */
    private final BigDecimal shippingCost;

    public OrderUseCase(
            com.agromarket.domain.ports.out.order.OrderPort orderPort,
            ProductPort productPort,
            UserPort userPort,
            OrderService orderService,
            ProductService productService,
            ProductStockService productStockService,
            com.agromarket.domain.ports.out.config.AppConfigPort appConfigPort,
            MessagingPort messagingPort,
            @Value("${app.shipping.cost:15000}") BigDecimal shippingCost) {
        this.orderPort = orderPort;
        this.productPort = productPort;
        this.userPort = userPort;
        this.orderService = orderService;
        this.productService = productService;
        this.productStockService = productStockService;
        this.appConfigPort = appConfigPort;
        this.messagingPort = messagingPort;
        this.shippingCost = shippingCost == null ? BigDecimal.ZERO : shippingCost;
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

        /*
         * Envío: el backend es la única fuente de verdad. Se cobra UNA única
         * vez por compra: el primer pedido de un checkout (mismo checkoutId)
         * lleva el costo de envío configurado; los siguientes llevan 0. Si el
         * cliente envía su propio valor (envio), se ignora y se recalcula.
         */
        String checkoutId = command.getCheckoutId();
        boolean primerPedidoDelCheckout = checkoutId != null
                && !checkoutId.isBlank()
                && !orderPort.existsByCheckoutId(checkoutId);
        BigDecimal envio = primerPedidoDelCheckout
                ? costoEnvioVigente()
                : BigDecimal.ZERO;

        Order order = Order.builder()
                .buyer(buyer)
                .product(product)
                .quantity(command.getQuantity())
                .unitPrice(unitPrice)
                .shippingCost(envio)
                .state(OrderState.PENDING)
                .checkoutId(checkoutId)
                .createdAt(LocalDateTime.now())
                .build();
        order.setTotal(orderService.calculateTotal(order));
        Order savedOrder = orderPort.save(order);
        notificarNuevoPedido(savedOrder);
        return toResult(savedOrder);
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
    public OrderResult updateOrderState(Long orderId, OrderState newState) {
        if (newState == null) {
            throw new IllegalArgumentException("El estado solicitado es obligatorio");
        }

        if (newState == OrderState.CANCELLED) {
            cancelOrder(orderId);
            OrderResult cancelled = getOrderById(orderId);
            notificarCambioEstado(orderId, OrderState.CANCELLED);
            return cancelled;
        }

        Order order = findOrder(orderId);
        OrderState current = order.getState();

        if (current == newState) {
            return toResult(order);
        }

        boolean transicionValida =
                (current == OrderState.PENDING && newState == OrderState.ACCEPTED)
                        || (current == OrderState.PENDING && newState == OrderState.SHIPPED)
                        || (current == OrderState.PENDING && newState == OrderState.DELIVERED)
                        || (current == OrderState.ACCEPTED && newState == OrderState.SHIPPED)
                        || (current == OrderState.ACCEPTED && newState == OrderState.DELIVERED)
                        || (current == OrderState.SHIPPED && newState == OrderState.DELIVERED);

        if (!transicionValida) {
            throw new IllegalStateException(
                    "Transición de estado no permitida: " + current + " -> " + newState);
        }

        order.setState(newState);
        orderPort.save(order);
        notificarCambioEstado(orderId, newState);
        return toResult(order);
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

    /**
     * Notifica al productor cuando llega un pedido nuevo (centro de
     * notificaciones). Nunca rompe la operación de negocio.
     */
    private void notificarNuevoPedido(Order order) {
        try {
            if (order.getProduct() == null
                    || order.getProduct().getProducer() == null
                    || order.getProduct().getProducer().getId() == null) {
                return;
            }
            String producto = order.getProduct().getName() == null
                    ? "tu producto"
                    : order.getProduct().getName();
            crearNotificacion(
                    order.getProduct().getProducer().getId(),
                    NotificationType.NEW_ORDER,
                    "¡Nuevo pedido #" + order.getId() + "! "
                            + order.getQuantity() + " kg de " + producto + ".");
        } catch (Exception ex) {
            // ignorado a propósito: la notificación es un efecto secundario
        }
    }

    /**
     * Crea notificaciones reales para comprador y productor cuando el pedido
     * cambia de estado (alimenta el centro de notificaciones).
     */
    private void notificarCambioEstado(Long orderId, OrderState estado) {
        try {
            Order order = findOrder(orderId);
            String etiqueta = etiquetaEstado(estado);

            if (order.getBuyer() != null && order.getBuyer().getId() != null) {
                crearNotificacion(
                        order.getBuyer().getId(),
                        NotificationType.ORDER_UPDATED,
                        "Tu pedido #" + orderId + " cambió de estado a "
                                + etiqueta + ".");
            }

            if (order.getProduct() != null
                    && order.getProduct().getProducer() != null
                    && order.getProduct().getProducer().getId() != null) {
                Long producerId = order.getProduct().getProducer().getId();
                Long buyerId = order.getBuyer() == null ? null : order.getBuyer().getId();
                if (buyerId == null || !producerId.equals(buyerId)) {
                    crearNotificacion(
                            producerId,
                            NotificationType.ORDER_UPDATED,
                            "El pedido #" + orderId + " pasó a " + etiqueta + ".");
                }
            }
        } catch (Exception ex) {
            // ignorado a propósito: la notificación es un efecto secundario
        }
    }

    private void crearNotificacion(Long recipientId, NotificationType type, String content) {
        messagingPort.createNotification(
                Notification.builder()
                        .recipient(User.builder().id(recipientId).build())
                        .type(type)
                        .content(content)
                        .read(false)
                        .createdAt(LocalDateTime.now())
                        .build());
    }

    private String etiquetaEstado(OrderState estado) {
        if (estado == null) {
            return "Pendiente";
        }
        return switch (estado) {
            case SHIPPED -> "Enviado";
            case DELIVERED -> "Entregado";
            case CANCELLED -> "Cancelado";
            default -> "Pendiente";
        };
    }

    /**
     * Costo de envío vigente: el valor dinámico guardado en base de datos
     * (actualizable desde el panel Admin) con el estático de configuración
     * como fallback.
     */
    private BigDecimal costoEnvioVigente() {
        return appConfigPort
                .getValor(com.agromarket.domain.ports.out.config.AppConfigPort.CLAVE_COSTO_ENVIO)
                .orElse(shippingCost);
    }

    private OrderResult toResult(Order order) {
        return OrderResult.builder()
                .id(order.getId())
                .buyer(order.getBuyer())
                .product(order.getProduct())
                .quantity(order.getQuantity())
                .unitPrice(order.getUnitPrice())
                .total(order.getTotal())
                .shippingCost(order.getShippingCost())
                .state(order.getState())
                .createdAt(order.getCreatedAt())
                .checkoutId(order.getCheckoutId())
                .build();
    }
}
