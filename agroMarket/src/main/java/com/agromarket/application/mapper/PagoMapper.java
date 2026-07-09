package com.agromarket.application.mapper;

import com.agromarket.application.api.response.PagoResponse;
import com.agromarket.application.persistence.sql.entities.PagoEntity;
import com.agromarket.domain.models.Pago;

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
