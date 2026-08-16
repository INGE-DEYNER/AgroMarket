package com.agromarket.application.adapters.persistence.sql.adapters.shipping;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.agromarket.application.adapters.persistence.sql.entities.order.OrderEntity;
import com.agromarket.application.adapters.persistence.sql.entities.shipping.ShippingEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.shipping.ShippingJpaRepository;
import com.agromarket.domain.models.shipping.Shipping;
import com.agromarket.domain.ports.out.shipping.ShippingPort;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ShippingSqlAdapter implements ShippingPort {

    private final ShippingJpaRepository repository;

    @Override
    public List<Shipping> findByOrderId(Long orderId) {
        return repository.findByOrder_Id(orderId)
                .stream()
                .map(ShippingEntity::toDomain)
                .toList();
    }

    @Override
    public Optional<Shipping> findById(Long id) {
        return repository.findById(id)
                .map(ShippingEntity::toDomain);
    }

    @Override
    public Shipping save(Shipping shipping) {
        if (shipping.getOrder() == null
                || shipping.getOrder().getId() == null) {
            throw new IllegalArgumentException(
                    "El envío debe tener un orderId");
        }

        OrderEntity orderReference = new OrderEntity();
        orderReference.setId(shipping.getOrder().getId());

        return repository.save(
                ShippingEntity.fromDomain(shipping, orderReference))
                .toDomain();
    }

    @Override
    public List<Shipping> findAll() {
        return repository.findAll()
                .stream()
                .map(ShippingEntity::toDomain)
                .toList();
    }

    @Override
    public List<Shipping> findByBuyerId(Long buyerId) {
        return repository.findByBuyerId(buyerId)
                .stream()
                .map(ShippingEntity::toDomain)
                .toList();
    }

    @Override
    public List<Shipping> findByProducerId(Long producerId) {
        return repository.findByProducerId(producerId)
                .stream()
                .map(ShippingEntity::toDomain)
                .toList();
    }
}
