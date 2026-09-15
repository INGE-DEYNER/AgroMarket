package com.agromarket.application.adapters.persistence.sql.adapters.order;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.application.adapters.persistence.sql.entities.order.OrderEntity;
import com.agromarket.application.adapters.persistence.sql.entities.order.OrderItemEntity;
import com.agromarket.application.adapters.persistence.sql.entities.product.ProductEntity;
import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.order.OrderJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.order.OrderItemJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.product.ProductJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.user.UserJpaRepository;
import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.models.order.OrderItem;
import com.agromarket.domain.ports.out.order.OrderPort;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OrderSqlAdapter implements OrderPort {

    private final OrderJpaRepository orderRepository;
    private final OrderItemJpaRepository orderItemRepository;
    private final ProductJpaRepository productRepository;
    private final UserJpaRepository userRepository;

    @Override
    @Transactional
    public Order save(Order order) {

        if (order == null) {
            return null;
        }

        if (order.getBuyer() == null || order.getBuyer().getId() == null) {
            throw new IllegalArgumentException("El pedido debe tener un comprador válido");
        }

        UserEntity buyer = userRepository.findById(order.getBuyer().getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No existe el usuario comprador con id: "
                                        + order.getBuyer().getId()));

        OrderEntity entity = OrderEntity.builder()
                .id(order.getId())
                .buyer(buyer)
                .total(order.getTotal())
                .shippingCost(order.getShippingCost())
                .state(order.getState())
                .createdAt(order.getCreatedAt())
                .checkoutId(order.getCheckoutId())
                .build();

        OrderEntity savedOrder = orderRepository.save(entity);

        if (order.getItems() != null) {

            for (OrderItem item : order.getItems()) {

                if (item == null || item.getProduct() == null
                        || item.getProduct().getId() == null) {
                    throw new IllegalArgumentException(
                            "Cada item del pedido debe tener un producto válido");
                }

                ProductEntity product = productRepository.findById(
                        item.getProduct().getId()
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "No existe el producto con id: "
                                        + item.getProduct().getId()));

                OrderItemEntity itemEntity = OrderItemEntity.builder()
                        .id(item.getId())
                        .order(savedOrder)
                        .product(product)
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.calculateSubtotal())
                        .build();

                orderItemRepository.save(itemEntity);
            }
        }

        return findById(savedOrder.getId()).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> findById(Long id) {

        return orderRepository.findById(id)
                .map(OrderEntity::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> findAll() {

        return orderRepository.findAll()
                .stream()
                .map(OrderEntity::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> findByBuyerId(Long buyerId) {

        return orderRepository.findByBuyerId(buyerId)
                .stream()
                .map(OrderEntity::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> findByProducerId(Long producerId) {

        return orderRepository.findAll()
                .stream()
                .filter(order -> order.getItems() != null)
                .filter(order ->
                        order.getItems()
                                .stream()
                                .anyMatch(item ->
                                        item.getProduct() != null
                                                && item.getProduct().getProducer() != null
                                                && item.getProduct().getProducer().getId() != null
                                                && item.getProduct().getProducer().getId().equals(producerId)))
                .map(OrderEntity::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> findByState(
            com.agromarket.domain.models.enums.order.OrderState state) {

        return orderRepository.findByState(state)
                .stream()
                .map(OrderEntity::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsById(Long id) {

        return orderRepository.existsById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByCheckoutId(String checkoutId) {

        return orderRepository.existsByCheckoutId(checkoutId);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {

        orderRepository.deleteById(id);
    }
}