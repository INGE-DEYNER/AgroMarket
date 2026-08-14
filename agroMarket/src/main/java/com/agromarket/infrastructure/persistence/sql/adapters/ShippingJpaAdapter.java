package com.agromarket.infrastructure.persistence.sql.adapters;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.agromarket.domain.shipping.model.Shipping;
import com.agromarket.domain.shipping.ports.out.ShippingRepository;
import com.agromarket.infrastructure.persistence.sql.mapper.ShippingMapper;
import com.agromarket.infrastructure.persistence.sql.entities.ShippingEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.ShippingJpaRepository;

import lombok.RequiredArgsConstructor;

/**
 * Adaptador JPA que implementa el puerto ShippingRepository.
 * Este adaptador gestiona la persistencia de envíos en la base de datos,
 * permitiendo que el dominio no dependa directamente de JPA o Spring Data.
 * 
 * @author AgroMarket Team
 */
@Component
@RequiredArgsConstructor
public class ShippingJpaAdapter implements ShippingRepository {

    private final ShippingJpaRepository shippingJpaRepository;
    private final ShippingMapper shippingMapper;

    @Override
    public List<Shipping> findByOrderId(Long orderId) {
        return shippingJpaRepository.findByOrderId(orderId).stream()
                .map(shippingMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Shipping> findById(Long id) {
        return shippingJpaRepository.findById(id).map(shippingMapper::toDomain);
    }

    @Override
    public Shipping save(Shipping shipping) {
        ShippingEntity entity = shippingMapper.toEntity(shipping);
        ShippingEntity savedEntity = shippingJpaRepository.save(entity);
        return shippingMapper.toDomain(savedEntity);
    }

    @Override
    public List<Shipping> findAll() {
        return shippingJpaRepository.findAll().stream()
                .map(shippingMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Shipping> findByBuyerId(Long buyerId) {
        return shippingJpaRepository.findByOrderBuyerId(buyerId).stream()
                .map(shippingMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Shipping> findByProducerId(Long producerId) {
        return shippingJpaRepository.findByOrderProductProducerId(producerId).stream()
                .map(shippingMapper::toDomain)
                .collect(Collectors.toList());
    }
}
