package com.agromarket.application.mapper;

import com.agromarket.application.dto.NotificacionResponse;
import com.agromarket.domain.model.Notificacion;
import com.agromarket.infrastructure.persistence.entity.NotificacionEntity;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificacionMapper {
    default NotificacionResponse toResponse(NotificacionEntity entity) {
        if (entity == null) {
            return null;
        }
        return NotificacionResponse.builder()
                .id(entity.getId())
                .tipo(entity.getTipo())
                .contenido(entity.getContenido())
                .leida(entity.isLeida())
                .fecha(entity.getFecha())
                .build();
    }

    default Notificacion toDomain(NotificacionEntity entity) {
        if (entity == null) {
            return null;
        }
        return Notificacion.builder()
                .id(entity.getId())
                .tipo(entity.getTipo())
                .contenido(entity.getContenido())
                .leida(entity.isLeida())
                .fecha(entity.getFecha())
                .build();
    }
}
