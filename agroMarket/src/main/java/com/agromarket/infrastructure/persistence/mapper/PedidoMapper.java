package com.agromarket.infrastructure.persistence.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.agromarket.domain.models.Pedido;
import com.agromarket.infrastructure.persistence.sql.entities.PedidoEntity;
import com.agromarket.interfaces.rest.response.PedidoResponse;

@Mapper(componentModel = "spring", uses = {ProductoMapper.class, UsuarioMapper.class})
public interface PedidoMapper {

    Pedido toDomain(PedidoEntity entity);

    PedidoEntity toEntity(Pedido domain);

    @Mapping(target = "compradorNombre", source = "comprador.nombre")
    @Mapping(target = "productoNombre", source = "producto.nombre")
    @Mapping(target = "productoId", source = "producto.id")
    @Mapping(target = "productorNombre", source = "producto.productor.nombre")
    @Mapping(target = "pagado", expression = "java(pedido.getPago() != null && (" +
            "pedido.getPago().getEstado() == com.agromarket.domain.models.enums.EstadoPago.CONFIRMADO || " +
            "pedido.getPago().getEstado() == com.agromarket.domain.models.enums.EstadoPago.EN_FIDEICOMISO || " +
            "pedido.getPago().getEstado() == com.agromarket.domain.models.enums.EstadoPago.LIBERADO))")
    PedidoResponse toResponse(Pedido pedido);

    List<PedidoResponse> toResponseList(List<Pedido> pedidos);

    // Legacy method for transition
    @Mapping(target = "compradorNombre", source = "comprador.nombre")
    @Mapping(target = "productoNombre", source = "producto.nombre")
    @Mapping(target = "productoId", source = "producto.id")
    @Mapping(target = "productorNombre", source = "producto.productor.nombre")
    @Mapping(target = "pagado", expression = "java(entity.getPago() != null && (" +
            "entity.getPago().getEstado() == com.agromarket.domain.models.enums.EstadoPago.CONFIRMADO || " +
            "entity.getPago().getEstado() == com.agromarket.domain.models.enums.EstadoPago.EN_FIDEICOMISO || " +
            "entity.getPago().getEstado() == com.agromarket.domain.models.enums.EstadoPago.LIBERADO))")
    PedidoResponse toResponseFromEntity(PedidoEntity entity);

    List<PedidoResponse> toResponseListFromEntity(List<PedidoEntity> entities);
}
