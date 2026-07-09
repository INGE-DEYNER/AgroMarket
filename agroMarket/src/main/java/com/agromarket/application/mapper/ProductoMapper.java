package com.agromarket.application.mapper;

import java.util.List;
import java.util.stream.Collectors;

import com.agromarket.application.api.response.ProductoResponse;
import com.agromarket.application.persistence.sql.entities.ProductoEntity;
import com.agromarket.application.persistence.sql.entities.ResenaEntity;
import com.agromarket.domain.models.Producto;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductoMapper {
    default ProductoResponse toResponse(ProductoEntity entity) {
        if (entity == null) {
            return null;
        }
        double promedio = 0.0;
        long totalResenas = 0L;
        if (entity.getResenas() != null && !entity.getResenas().isEmpty()) {
            totalResenas = entity.getResenas().size();
            double totalCalificacion = 0.0;
            for (ResenaEntity resena : entity.getResenas()) {
                totalCalificacion += resena.getCalificacion();
            }
            promedio = totalCalificacion / totalResenas;
        }
        return ProductoResponse.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .precio(entity.getPrecio())
                .cantidadDisponible(entity.getCantidadDisponible())
                .stock(entity.getCantidadDisponible())
                .imagenUrl(entity.getImagenUrl())
                .tipoFruta(entity.getTipoFruta())
                .productorId(entity.getProductor() != null ? entity.getProductor().getId() : null)
                .productorNombre(entity.getProductor() != null ? entity.getProductor().getNombre() : null)
                .enPromocion(entity.isEnPromocion())
                .activo(entity.isActivo())
                .fechaCreacion(entity.getFechaCreacion())
                .cantidadMinimaMayorista(entity.getCantidadMinimaMayorista())
                .precioMayorista(entity.getPrecioMayorista())
                .calificacionPromedio(promedio)
                .totalResenas(totalResenas)
                .productorVerificado(entity.getProductor() != null && Boolean.TRUE.equals(entity.getProductor().getVerificado()))
                .totalVendido(entity.getTotalVendido() != null ? entity.getTotalVendido() : 0)
                .precioPromocion(entity.getPrecioPromocion())
                .fechaFinPromocion(entity.getFechaFinPromocion())
                .cantMinMayorista(entity.getCantidadMinimaMayorista())
                .categoria(entity.getTipoFruta() != null ? entity.getTipoFruta().name() : "OTRO")
                .build();
    }

    default List<ProductoResponse> toResponseList(List<ProductoEntity> entities) {
        return entities == null ? List.of() : entities.stream().map(this::toResponse).collect(Collectors.toList());
    }

    default Producto toDomain(ProductoEntity entity) {
        if (entity == null) {
            return null;
        }
        return Producto.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .precio(entity.getPrecio())
                .cantidadDisponible(entity.getCantidadDisponible())
                .imagenUrl(entity.getImagenUrl())
                .tipoFruta(entity.getTipoFruta())
                .enPromocion(entity.isEnPromocion())
                .activo(entity.isActivo())
                .fechaCreacion(entity.getFechaCreacion())
                .build();
    }
}
