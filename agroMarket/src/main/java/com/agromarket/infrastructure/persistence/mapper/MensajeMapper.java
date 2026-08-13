package com.agromarket.infrastructure.persistence.mapper;

import com.agromarket.interfaces.rest.response.MensajeResponse;
import com.agromarket.infrastructure.persistence.sql.entities.MensajeEntity;
import com.agromarket.domain.models.Mensaje;

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
