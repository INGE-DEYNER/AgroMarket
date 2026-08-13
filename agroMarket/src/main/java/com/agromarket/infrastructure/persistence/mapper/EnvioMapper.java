package com.agromarket.infrastructure.persistence.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.agromarket.domain.models.Envio;
import com.agromarket.infrastructure.persistence.sql.entities.EnvioEntity;
import com.agromarket.interfaces.rest.response.EnvioResponse;

@Mapper(componentModel = "spring", uses = {PedidoMapper.class})
public interface EnvioMapper {

    Envio toDomain(EnvioEntity entity);

    EnvioEntity toEntity(Envio domain);

    @Mapping(target = "pedidoId", source = "pedido.id")
    EnvioResponse toResponse(Envio envio);

    @Mapping(target = "pedidoId", source = "pedido.id")
    EnvioResponse toResponseFromEntity(EnvioEntity entity);
}
