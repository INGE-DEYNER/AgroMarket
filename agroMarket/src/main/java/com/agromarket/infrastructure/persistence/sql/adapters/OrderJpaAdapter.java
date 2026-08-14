package com.agromarket.infrastructure.persistence.sql.adapters;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.agromarket.domain.order.enums.OrderState;
import com.agromarket.domain.order.model.Order;
import com.agromarket.domain.order.ports.out.OrderRepository;
import com.agromarket.infrastructure.persistence.sql.entities.OrderEntity;
import com.agromarket.infrastructure.persistence.sql.entities.PaymentEntity;
import com.agromarket.infrastructure.persistence.sql.entities.ProductEntity;
import com.agromarket.infrastructure.persistence.sql.entities.ShippingEntity;
import com.agromarket.infrastructure.persistence.sql.entities.UserEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.OrderJpaRepository;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

/**
 * Adaptador JPA para el repositorio de pedidos.
 * Implementa el puerto de salida OrderRepository usando JPA/Hibernate.
 * Mapea entre entidades de dominio y entidades JPA.
 * 
 * @author AgroMarket Team
 */
@Component
@RequiredArgsConstructor
public class OrderJpaAdapter implements OrderRepository {
    
    private final OrderJpaRepository orderJpaRepository;

    /**
     * Convierte una entidad de dominio Order a OrderEntity.
     */
    private OrderEntity toEntity(Order order) {
        if (order == null) {
            return null;
        }
        return OrderEntity.builder()
                .id(order.getId())
                .buyer(order.getBuyer() != null ? 
                    UserEntity.builder().id(order.getBuyer().getId()).build() : null)
                .product(order.getProduct() != null ? 
                    ProductEntity.builder().id(order.getProduct().getId()).build() : null)
                .quantity(order.getQuantity())
                .unitPrice(order.getUnitPrice())
                .total(order.getTotal())
                .state(order.getState())
                .createdAt(order.getCreatedAt())
                .checkoutId(order.getCheckoutId())
                .payment(order.getPayment() != null ? 
                    PaymentEntity.builder().id(order.getPayment().getId()).build() : null)
                .shipping(order.getShipping() != null ? 
                    ShippingEntity.builder().id(order.getShipping().getId()).build() : null)
                .build();
    }

    /**
     * Convierte una OrderEntity a entidad de dominio Order.
     */
    private Order toDomain(OrderEntity entity) {
        if (entity == null) {
            return null;
        }
        return Order.builder()
                .id(entity.getId())
                .buyer(entity.getBuyer() != null ? 
                    com.agromarket.domain.user.model.User.builder()
                        .id(entity.getBuyer().getId())
                        .build() : null)
                .product(entity.getProduct() != null ? 
                    com.agromarket.domain.product.model.Product.builder()
                        .id(entity.getProduct().getId())
                        .build() : null)
                .quantity(entity.getQuantity())
                .unitPrice(entity.getUnitPrice())
                .total(entity.getTotal())
                .state(entity.getState())
                .createdAt(entity.getCreatedAt())
                .checkoutId(entity.getCheckoutId())
                .build();
    }

    @Override
    public Order save(Order order) {
        OrderEntity entity = toEntity(order);
        OrderEntity savedEntity = orderJpaRepository.save(entity);
        return toDomain(savedEntity);
    }

    @Override
    public Optional<Order> findById(Long id) {
        return orderJpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Order> findAll() {
        return orderJpaRepository.findAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> findByBuyerId(Long buyerId) {
        return orderJpaRepository.findByBuyerId(buyerId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> findByProducerId(Long producerId) {
        return orderJpaRepository.findByProductProducerId(producerId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> findByState(OrderState state) {
        return orderJpaRepository.findByState(state).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Order order) {
        OrderEntity entity = toEntity(order);
        if (entity != null) {
            orderJpaRepository.delete(entity);
        }
    }

    @Override
    public boolean existsById(Long id) {
        return orderJpaRepository.existsById(id);
    }
}
