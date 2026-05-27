package com.agromarket.application.mapper;

import com.agromarket.application.dto.MensajeResponse;
import com.agromarket.domain.model.Mensaje;
import com.agromarket.infrastructure.persistence.entity.MensajeEntity;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MensajeMapper {
    default MensajeResponse toResponse(MensajeEntity entity) {
        if (entity == null) {
            return null;
        }
        return MensajeResponse.builder()
                .id(entity.getId())
                .remitenteId(entity.getRemitente() != null ? entity.getRemitente().getId() : null)
                .remitenteNombre(entity.getRemitente() != null ? entity.getRemitente().getNombre() : null)
                .destinatarioId(entity.getDestinatario() != null ? entity.getDestinatario().getId() : null)
                .contenido(entity.getContenido())
                .leido(entity.isLeido())
                .fechaEnvio(entity.getFechaEnvio())
                .build();
    }

    default Mensaje toDomain(MensajeEntity entity) {
        if (entity == null) {
            return null;
        }
        return Mensaje.builder()
                .id(entity.getId())
                .contenido(entity.getContenido())
                .leido(entity.isLeido())
                .fechaEnvio(entity.getFechaEnvio())
                .build();
    }
}
