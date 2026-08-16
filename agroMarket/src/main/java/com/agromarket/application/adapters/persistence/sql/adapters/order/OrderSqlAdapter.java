package com.agromarket.application.adapters.persistence.sql.adapters.order;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import com.agromarket.application.adapters.persistence.sql.entities.order.OrderEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.order.OrderJpaRepository;
import com.agromarket.application.adapters.persistence.sql.entities.product.ProductEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.product.ProductJpaRepository;
import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.user.UserJpaRepository;
import com.agromarket.domain.models.enums.order.OrderState;
import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.ports.out.order.OrderPort;

@Component
@Profile("sql")
public class OrderSqlAdapter implements OrderPort {
    private final OrderJpaRepository repository;
    private final UserJpaRepository users;
    private final ProductJpaRepository products;

    public OrderSqlAdapter(OrderJpaRepository repository, UserJpaRepository users, ProductJpaRepository products) {
        this.repository = repository;
        this.users = users;
        this.products = products;
    }

    public Order save(Order order) {
        UserEntity buyer = users.findById(order.getBuyer().getId()).orElseThrow();
        ProductEntity product = products.findById(order.getProduct().getId()).orElseThrow();
        return repository.save(OrderEntity.fromDomain(order, buyer, product)).toDomain();
    }

    public Optional<Order> findById(Long id) {
        return repository.findById(id).map(OrderEntity::toDomain);
    }

    public List<Order> findAll() {
        return repository.findAll().stream().map(OrderEntity::toDomain).collect(Collectors.toList());
    }

    public List<Order> findByBuyerId(Long id) {
        return repository.findByBuyer_Id(id).stream().map(OrderEntity::toDomain).collect(Collectors.toList());
    }

    public List<Order> findByProducerId(Long id) {
        return repository.findByProducerId(id).stream().map(OrderEntity::toDomain).collect(Collectors.toList());
    }

    public List<Order> findByState(OrderState s) {
        return repository.findByState(s).stream().map(OrderEntity::toDomain).collect(Collectors.toList());
    }

    public void delete(Order order) {
        repository.deleteById(order.getId());
    }

    public boolean existsById(Long id) {
        return repository.existsById(id);
    }
}
