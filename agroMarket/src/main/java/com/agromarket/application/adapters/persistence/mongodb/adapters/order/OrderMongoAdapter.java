package com.agromarket.application.adapters.persistence.mongodb.adapters.order;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import com.agromarket.application.adapters.persistence.mongodb.documents.order.OrderDocument;
import com.agromarket.application.adapters.persistence.mongodb.repositories.order.OrderMongoRepository;
import com.agromarket.domain.models.enums.order.OrderState;
import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.ports.out.order.OrderPort;

@Component
@Profile("mongo")
public class OrderMongoAdapter implements OrderPort {
    private final OrderMongoRepository repository;

    public OrderMongoAdapter(OrderMongoRepository repository) {
        this.repository = repository;
    }

    public Order save(Order order) {
        return repository.save(OrderDocument.fromDomain(order)).toDomain();
    }

    public Optional<Order> findById(Long id) {
        return repository.findById(String.valueOf(id)).map(OrderDocument::toDomain);
    }

    public List<Order> findAll() {
        return repository.findAll().stream().map(OrderDocument::toDomain).collect(Collectors.toList());
    }

    public List<Order> findByBuyerId(Long id) {
        return repository.findByBuyerId(id).stream().map(OrderDocument::toDomain).collect(Collectors.toList());
    }

    public List<Order> findByProducerId(Long id) {
        return repository.findByProducerId(id).stream().map(OrderDocument::toDomain).collect(Collectors.toList());
    }

    public List<Order> findByState(OrderState state) {
        return repository.findByState(state).stream().map(OrderDocument::toDomain).collect(Collectors.toList());
    }

    public void delete(Order order) {
        repository.delete(OrderDocument.fromDomain(order));
    }

    public boolean existsById(Long id) {
        return repository.existsById(String.valueOf(id));
    }
}
