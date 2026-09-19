package com.agromarket.application.usecases.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
import com.agromarket.domain.models.order.OrderItem;
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
 *
 * <p>
 * Un pedido se compone de uno o varios {@link OrderItem}, por lo que todas las
 * operaciones (alta, cancelación, notificaciones y proyección a
 * {@link OrderResult}) trabajan sobre los ítems y no sobre un único producto.
 * </p>
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
    private final MessagingPort messagingPort;
    private final double shippingOriginLatitude;
    private final double shippingOriginLongitude;
    private final BigDecimal shippingPricePerKilometer;
    private final BigDecimal shippingMinimumCost;

    public OrderUseCase(
            com.agromarket.domain.ports.out.order.OrderPort orderPort,
            ProductPort productPort,
            UserPort userPort,
            OrderService orderService,
            ProductService productService,
            ProductStockService productStockService,
            MessagingPort messagingPort,
            @Value("${app.shipping.origin-latitude}") double shippingOriginLatitude,
            @Value("${app.shipping.origin-longitude}") double shippingOriginLongitude,
            @Value("${app.shipping.price-per-kilometer}") BigDecimal shippingPricePerKilometer,
            @Value("${app.shipping.minimum-cost:0}") BigDecimal shippingMinimumCost) {
        this.orderPort = orderPort;
        this.productPort = productPort;
        this.userPort = userPort;
        this.orderService = orderService;
        this.productService = productService;
        this.productStockService = productStockService;
        this.messagingPort = messagingPort;
        this.shippingOriginLatitude = shippingOriginLatitude;
        this.shippingOriginLongitude = shippingOriginLongitude;
        this.shippingPricePerKilometer = shippingPricePerKilometer;
        this.shippingMinimumCost = shippingMinimumCost;
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
         * lleva el costo calculado por distancia; los siguientes llevan 0.
         * El valor enviado por el cliente nunca es la fuente de verdad.
         */
        String checkoutId = command.getCheckoutId();
        boolean primerPedidoDelCheckout = checkoutId != null
                && !checkoutId.isBlank()
                && !orderPort.existsByCheckoutId(checkoutId);
        BigDecimal envio = primerPedidoDelCheckout
            ? calcularCostoEnvio(command)
                : BigDecimal.ZERO;

        Order order = Order.builder()
                .buyer(buyer)
                .items(new ArrayList<>(List.of(crearItem(product, command.getQuantity(), unitPrice))))
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

    /**
     * Construye un ítem del pedido congelando el precio efectivo del producto
     * en el momento de la compra.
     */
    private OrderItem crearItem(Product product, Integer quantity, BigDecimal unitPrice) {

        OrderItem item = OrderItem.builder()
                .product(product)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .build();

        item.setSubtotal(item.calculateSubtotal());
        return item;
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
        // Devuelve al inventario la cantidad de cada ítem del pedido.
        devolverStock(order);
        orderPort.save(order);
    }

    /**
     * Repone el stock de todos los ítems del pedido (compra cancelada).
     */
    private void devolverStock(Order order) {

        if (order.getItems() == null) {
            return;
        }

        for (OrderItem item : order.getItems()) {

            if (item == null
                    || item.getProduct() == null
                    || item.getProduct().getId() == null
                    || item.getQuantity() == null) {
                continue;
            }

            Product product = productPort.findById(item.getProduct().getId())
                    .orElseThrow(() -> new IllegalArgumentException("El producto asociado no existe"));
            productStockService.increase(product, item.getQuantity());
            productPort.save(product);
        }
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
        // Valida existencia para mantener el 404 de OrderNotFoundException.
        findOrder(id);
        orderPort.deleteById(id);
    }

    private Order findOrder(Long id) {
        return orderPort.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Pedido no encontrado: " + id));
    }

    /**
     * Resumen de los ítems de un pedido agrupados por productor.
     */
    private record ResumenProductor(Long producerId, String descripcion) {
    }

    /**
     * Notifica a cada productor involucrado cuando llega un pedido nuevo
     * (centro de notificaciones). Nunca rompe la operación de negocio.
     */
    private void notificarNuevoPedido(Order order) {
        try {
            for (ResumenProductor resumen : resumenesPorProductor(order)) {
                crearNotificacion(
                        resumen.producerId(),
                        NotificationType.NEW_ORDER,
                        "¡Nuevo pedido #" + order.getId() + "! " + resumen.descripcion() + ".");
            }
        } catch (Exception ex) {
            // ignorado a propósito: la notificación es un efecto secundario
        }
    }

    /**
     * Crea notificaciones reales para comprador y productores cuando el pedido
     * cambia de estado (alimenta el centro de notificaciones).
     */
    private void notificarCambioEstado(Long orderId, OrderState estado) {
        try {
            Order order = findOrder(orderId);
            String etiqueta = etiquetaEstado(estado);
            Long buyerId = order.getBuyer() == null ? null : order.getBuyer().getId();

            if (buyerId != null) {
                crearNotificacion(
                        buyerId,
                        NotificationType.ORDER_UPDATED,
                        "Tu pedido #" + orderId + " cambió de estado a " + etiqueta + ".");
            }

            for (ResumenProductor resumen : resumenesPorProductor(order)) {
                if (resumen.producerId().equals(buyerId)) {
                    continue;
                }
                crearNotificacion(
                        resumen.producerId(),
                        NotificationType.ORDER_UPDATED,
                        "El pedido #" + orderId + " pasó a " + etiqueta + ".");
            }
        } catch (Exception ex) {
            // ignorado a propósito: la notificación es un efecto secundario
        }
    }

    /**
     * Agrupa los ítems del pedido por productor para poder notificar a cada
     * uno con los productos que le corresponden.
     */
    private List<ResumenProductor> resumenesPorProductor(Order order) {

        if (order == null || order.getItems() == null) {
            return List.of();
        }

        Map<Long, StringBuilder> detalles = new LinkedHashMap<>();

        for (OrderItem item : order.getItems()) {

            if (item == null || item.getProduct() == null) {
                continue;
            }

            User producer = item.getProduct().getProducer();

            if (producer == null || producer.getId() == null) {
                continue;
            }

            String nombre = item.getProduct().getName() == null
                    ? "tu producto"
                    : item.getProduct().getName();
            String cantidad = item.getQuantity() == null
                    ? ""
                    : item.getQuantity() + " kg de ";

            StringBuilder detalle = detalles.computeIfAbsent(
                    producer.getId(), id -> new StringBuilder());

            if (detalle.length() > 0) {
                detalle.append(", ");
            }

            detalle.append(cantidad).append(nombre);
        }

        return detalles.entrySet().stream()
                .map(entrada -> new ResumenProductor(
                        entrada.getKey(), entrada.getValue().toString()))
                .toList();
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

    private BigDecimal calcularCostoEnvio(CreateOrderCommand command) {
        double originLatitude = requireCoordinate(command.getOriginLatitude(), "originLatitude");
        double originLongitude = requireCoordinate(command.getOriginLongitude(), "originLongitude");
        double destinationLatitude = requireCoordinate(command.getDestinationLatitude(), "destinationLatitude");
        double destinationLongitude = requireCoordinate(command.getDestinationLongitude(), "destinationLongitude");

        double distanceKilometers = haversineKilometers(
                originLatitude, originLongitude, destinationLatitude, destinationLongitude);
        BigDecimal distanceCost = shippingPricePerKilometer
                .multiply(BigDecimal.valueOf(distanceKilometers));

        return distanceCost.max(shippingMinimumCost).setScale(0, java.math.RoundingMode.CEILING);
    }

    private double requireCoordinate(Double coordinate, String name) {
        if (coordinate == null || !Double.isFinite(coordinate)) {
            throw new IllegalArgumentException("Falta la coordenada " + name + " del envío");
        }
        return coordinate;
    }

    private double haversineKilometers(
            double originLatitude,
            double originLongitude,
            double destinationLatitude,
            double destinationLongitude) {
        double earthRadiusKilometers = 6371.0088;
        double latitudeDelta = Math.toRadians(destinationLatitude - originLatitude);
        double longitudeDelta = Math.toRadians(destinationLongitude - originLongitude);
        double a = Math.pow(Math.sin(latitudeDelta / 2), 2)
                + Math.cos(Math.toRadians(originLatitude))
                        * Math.cos(Math.toRadians(destinationLatitude))
                        * Math.pow(Math.sin(longitudeDelta / 2), 2);
        return earthRadiusKilometers * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    /**
     * Proyecta el agregado a la vista de salida. {@code items} expone todos los
     * ítems del pedido; {@code product}/{@code quantity}/{@code unitPrice}
     * reflejan el primer ítem por compatibilidad con los clientes actuales.
     */
    private OrderResult toResult(Order order) {

        List<OrderItem> items = order.getItems() == null
                ? List.of()
                : order.getItems();
        OrderItem primerItem = items.isEmpty() ? null : items.get(0);

        return OrderResult.builder()
                .id(order.getId())
                .buyer(order.getBuyer())
                .items(items)
                .product(primerItem == null ? null : primerItem.getProduct())
                .quantity(primerItem == null ? null : primerItem.getQuantity())
                .unitPrice(primerItem == null ? null : primerItem.getUnitPrice())
                .total(order.getTotal())
                .shippingCost(order.getShippingCost())
                .state(order.getState())
                .createdAt(order.getCreatedAt())
                .checkoutId(order.getCheckoutId())
                .build();
    }
}