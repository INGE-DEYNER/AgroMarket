package com.agromarket.application.mapper;

import java.util.List;
import java.util.stream.Collectors;

import com.agromarket.application.dto.PedidoResponse;
import com.agromarket.domain.model.Pedido;
import com.agromarket.infrastructure.persistence.entity.PedidoEntity;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PedidoMapper {
    default PedidoResponse toResponse(PedidoEntity entity) {
        if (entity == null) {
            return null;
        }
        return PedidoResponse.builder()
                .id(entity.getId())
                .compradorNombre(entity.getComprador() != null ? entity.getComprador().getNombre() : null)
                .productoNombre(entity.getProducto() != null ? entity.getProducto().getNombre() : null)
                .productoId(entity.getProducto() != null ? entity.getProducto().getId() : null)
                .productorNombre(entity.getProducto() != null && entity.getProducto().getProductor() != null ? entity.getProducto().getProductor().getNombre() : null)
                .cantidad(entity.getCantidad())
                .precioUnitario(entity.getPrecioUnitario())
                .total(entity.getTotal())
                .estado(entity.getEstado())
                .fechaCreacion(entity.getFechaCreacion())
                .checkoutId(entity.getCheckoutId())
                .build();
    }

    default List<PedidoResponse> toResponseList(List<PedidoEntity> entities) {
        return entities == null ? List.of() : entities.stream().map(this::toResponse).collect(Collectors.toList());
    }

    default Pedido toDomain(PedidoEntity entity) {
        if (entity == null) {
            return null;
        }
        return Pedido.builder()
                .id(entity.getId())
                .cantidad(entity.getCantidad())
                .precioUnitario(entity.getPrecioUnitario())
                .total(entity.getTotal())
                .estado(entity.getEstado())
                .fechaCreacion(entity.getFechaCreacion())
                .checkoutId(entity.getCheckoutId())
                .build();
    }
}
