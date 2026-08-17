
package com.agromarket.application.adapters.persistence.sql.adapters.order;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

import com.agromarket.application.adapters.persistence.sql.entities.order.OrderEntity;
import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.order.OrderJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.user.UserJpaRepository;
import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.ports.out.order.OrderPort;
import com.agromarket.domain.ports.out.product.ProductPort;

@Component
@RequiredArgsConstructor
public class OrderSqlAdapter implements OrderPort {

    private final OrderJpaRepository repository;
    private final UserJpaRepository users;
    private final ProductPort productPort;

    @Override
    public Order save(Order order) {

        UserEntity buyer = order.getBuyer() == null
                ? null
                : users.findById(order.getBuyer().getId())
                        .orElse(null);

        Long productId = order.getProduct() == null
                ? null
                : order.getProduct().getId();

        OrderEntity entity = OrderEntity.fromDomain(order, buyer, productId);

        OrderEntity saved = repository.save(entity);

        return toDomain(saved);
    }

    @Override
    public java.util.Optional<Order> findById(Long id) {
        return repository.findById(id)
                .map(entity -> toDomain(entity));
    }

    @Override
    public List<Order> findAll() {
        return repository.findAll()
                .stream()
                .map(entity -> toDomain(entity))
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> findByBuyerId(Long buyerId) {
        return repository.findByBuyerId(buyerId)
                .stream()
                .map(entity -> toDomain(entity))
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> findByProducerId(Long producerId) {

        return repository.findAll()
                .stream()
                .map(entity -> toDomain(entity))
                .filter(order -> order.getProduct() != null
                        && order.getProduct().getProducer() != null
                        && order.getProduct().getProducer().getId() != null
                        && order.getProduct().getProducer().getId().equals(producerId))
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> findByState(
            com.agromarket.domain.models.enums.order.OrderState state) {

        return repository.findByState(state)
                .stream()
                .map(entity -> toDomain(entity))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Order order) {
        if (order != null && order.getId() != null) {
            repository.deleteById(order.getId());
        }
    }

    private Order toDomain(OrderEntity entity) {

        Product product = null;

        if (entity.getProductId() != null) {
            product = productPort
                    .findById(entity.getProductId())
                    .orElse(null);
        }

        return entity.toDomain(product);
    }
}