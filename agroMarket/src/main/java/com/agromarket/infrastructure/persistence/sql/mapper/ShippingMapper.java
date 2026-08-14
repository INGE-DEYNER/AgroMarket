package com.agromarket.infrastructure.persistence.sql.mapper;

import org.springframework.stereotype.Component;

import com.agromarket.domain.shipping.model.Shipping;
import com.agromarket.infrastructure.persistence.sql.entities.ShippingEntity;

import lombok.RequiredArgsConstructor;

/**
 * Mapper para convertir entre entidades JPA y objetos de dominio para envíos.
 * Este mapper gestiona la conversión entre ShippingEntity y Shipping.
 * 
 * @author AgroMarket Team
 */
@Component
@RequiredArgsConstructor
public class ShippingMapper {

    private final OrderMapper orderMapper;

    /**
     * Convierte una entidad JPA a un objeto de dominio Shipping.
     * 
     * @param entity la entidad JPA a convertir
     * @return el objeto de dominio Shipping, o null si la entidad es null
     */
    public Shipping toDomain(ShippingEntity entity) {
        if (entity == null) return null;
        return Shipping.builder()
                .id(entity.getId())
                .order(orderMapper.toDomain(entity.getOrder()))
                .destinationAddress(entity.getDestinationAddress())
                .state(entity.getState())
                .carrier(entity.getCarrier())
                .trackingNumber(entity.getTrackingNumber())
                .estimatedDeliveryDate(entity.getEstimatedDeliveryDate())
                .origin(entity.getOrigin())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    /**
     * Convierte un objeto de dominio Shipping a una entidad JPA.
     * 
     * @param domain el objeto de dominio a convertir
     * @return la entidad JPA, o null si el dominio es null
     */
    public ShippingEntity toEntity(Shipping domain) {
        if (domain == null) return null;
        return ShippingEntity.builder()
                .id(domain.getId())
                .order(orderMapper.toEntity(domain.getOrder()))
                .destinationAddress(domain.getDestinationAddress())
                .state(domain.getState())
                .carrier(domain.getCarrier())
                .trackingNumber(domain.getTrackingNumber())
                .estimatedDeliveryDate(domain.getEstimatedDeliveryDate())
                .origin(domain.getOrigin())
                .createdAt(domain.getCreatedAt())
                .build();
    }
}
