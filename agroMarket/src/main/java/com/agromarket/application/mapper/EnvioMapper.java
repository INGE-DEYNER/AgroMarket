package com.agromarket.application.mapper;

import com.agromarket.application.api.response.EnvioResponse;
import com.agromarket.application.persistence.sql.entities.EnvioEntity;
import com.agromarket.domain.models.Envio;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EnvioMapper {
    default EnvioResponse toResponse(EnvioEntity entity) {
        if (entity == null) {
            return null;
        }
        return EnvioResponse.builder()
                .id(entity.getId())
                .pedidoId(entity.getPedido() != null ? entity.getPedido().getId() : null)
                .origen(entity.getOrigen())
                .direccionDestino(entity.getDireccionDestino())
                .estado(entity.getEstado())
                .transportista(entity.getTransportista())
                .guia(entity.getGuia())
                .fechaEstimadaEntrega(entity.getFechaEstimadaEntrega())
                .build();
    }

    default Envio toDomain(EnvioEntity entity) {
        if (entity == null) {
            return null;
        }
        return Envio.builder()
                .id(entity.getId())
                .direccionDestino(entity.getDireccionDestino())
                .estado(entity.getEstado())
                .transportista(entity.getTransportista())
                .guia(entity.getGuia())
                .fechaEstimadaEntrega(entity.getFechaEstimadaEntrega())
                .origen(entity.getOrigen())
                .fechaCreacion(entity.getFechaCreacion())
                .build();
    }
}
