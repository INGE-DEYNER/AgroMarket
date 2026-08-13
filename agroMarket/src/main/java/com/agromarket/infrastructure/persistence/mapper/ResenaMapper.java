package com.agromarket.infrastructure.persistence.mapper;

import java.util.List;
import java.util.stream.Collectors;

import com.agromarket.interfaces.rest.response.ResenaResponse;
import com.agromarket.infrastructure.persistence.sql.entities.ResenaEntity;
import com.agromarket.domain.models.Resena;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ResenaMapper {
    default ResenaResponse toResponse(ResenaEntity entity) {
        if (entity == null) {
            return null;
        }
        return ResenaResponse.builder()
                .id(entity.getId())
                .compradorNombre(entity.getComprador() != null ? entity.getComprador().getNombre() : null)
                .calificacion(entity.getCalificacion())
                .comentario(entity.getComentario())
                .fecha(entity.getFecha())
                .build();
    }

    default List<ResenaResponse> toResponseList(List<ResenaEntity> entities) {
        return entities == null ? List.of() : entities.stream().map(this::toResponse).collect(Collectors.toList());
    }

    default Resena toDomain(ResenaEntity entity) {
        if (entity == null) {
            return null;
        }
        return Resena.builder()
                .id(entity.getId())
                .calificacion(entity.getCalificacion())
                .comentario(entity.getComentario())
                .fecha(entity.getFecha())
                .build();
    }
}
