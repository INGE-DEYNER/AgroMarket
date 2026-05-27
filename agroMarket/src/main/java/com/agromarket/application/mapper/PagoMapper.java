package com.agromarket.application.mapper;

import com.agromarket.application.dto.PagoResponse;
import com.agromarket.domain.model.Pago;
import com.agromarket.infrastructure.persistence.entity.PagoEntity;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PagoMapper {
    default PagoResponse toResponse(PagoEntity entity) {
        if (entity == null) {
            return null;
        }
        return PagoResponse.builder()
                .id(entity.getId())
                .pedidoId(entity.getPedido() != null ? entity.getPedido().getId() : null)
                .monto(entity.getMonto())
                .metodoPago(entity.getMetodoPago())
                .estado(entity.getEstado())
                .referenciaPasarela(entity.getReferenciaPasarela())
                .fechaPago(entity.getFechaPago())
                .build();
    }

    default Pago toDomain(PagoEntity entity) {
        if (entity == null) {
            return null;
        }
        return Pago.builder()
                .id(entity.getId())
                .monto(entity.getMonto())
                .metodoPago(entity.getMetodoPago())
                .estado(entity.getEstado())
                .referenciaPasarela(entity.getReferenciaPasarela())
                .fechaPago(entity.getFechaPago())
                .build();
    }
}
