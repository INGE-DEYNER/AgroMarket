package com.agromarket.infrastructure.persistence.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.agromarket.domain.models.Producto;
import com.agromarket.infrastructure.persistence.sql.entities.ProductoEntity;
import com.agromarket.interfaces.rest.response.ProductoResponse;

@Mapper(componentModel = "spring", uses = {UsuarioMapper.class})
public interface ProductoMapper {

    Producto toDomain(ProductoEntity entity);

    @Mapping(target = "resenas", ignore = true)
    ProductoEntity toEntity(Producto domain);

    @Mapping(target = "productorId", source = "productor.id")
    @Mapping(target = "productorNombre", source = "productor.nombre")
    @Mapping(target = "stock", source = "cantidadDisponible")
    @Mapping(target = "cantMinMayorista", source = "cantidadMinimaMayorista")
    @Mapping(target = "categoria", expression = "java(producto.getTipoFruta() != null ? producto.getTipoFruta().name() : \"OTRO\")")
    @Mapping(target = "productorVerificado", expression = "java(producto.getProductor() != null && producto.getProductor() instanceof com.agromarket.domain.models.Productor ? ((com.agromarket.domain.models.Productor)producto.getProductor()).getVerificado() : false)")
    @Mapping(target = "calificacionPromedio", expression = "java(producto.calcularCalificacionPromedio(producto.getResenas()))")
    @Mapping(target = "totalResenas", expression = "java(producto.getResenas() != null ? (long) producto.getResenas().size() : 0L)")
    ProductoResponse toResponse(Producto producto);

    List<ProductoResponse> toResponseList(List<Producto> productos);
    
    // For legacy usecases still using entity during transition
    @Mapping(target = "productorId", source = "productor.id")
    @Mapping(target = "productorNombre", source = "productor.nombre")
    @Mapping(target = "stock", source = "cantidadDisponible")
    @Mapping(target = "cantMinMayorista", source = "cantidadMinimaMayorista")
    @Mapping(target = "categoria", expression = "java(entity.getTipoFruta() != null ? entity.getTipoFruta().name() : \"OTRO\")")
    @Mapping(target = "productorVerificado", expression = "java(entity.getProductor() != null ? Boolean.TRUE.equals(entity.getProductor().getVerificado()) : false)")
    @Mapping(target = "calificacionPromedio", expression = "java(calcularPromedioEntity(entity))")
    @Mapping(target = "totalResenas", expression = "java(entity.getResenas() != null ? (long) entity.getResenas().size() : 0L)")
    ProductoResponse toResponseFromEntity(ProductoEntity entity);

    List<ProductoResponse> toResponseListFromEntity(List<ProductoEntity> entities);
    
    default double calcularPromedioEntity(ProductoEntity entity) {
        if (entity == null || entity.getResenas() == null || entity.getResenas().isEmpty()) {
            return 0.0;
        }
        double total = 0;
        for (var r : entity.getResenas()) {
            total += r.getCalificacion();
        }
        return total / entity.getResenas().size();
    }
}
