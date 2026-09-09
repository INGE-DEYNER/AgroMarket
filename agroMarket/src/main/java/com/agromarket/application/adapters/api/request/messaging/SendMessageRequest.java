package com.agromarket.application.adapters.api.request.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Cuerpo de POST /mensajes. El frontend envía {destinatarioId, contenido};
 * se mantienen también los nombres en inglés para compatibilidad.
 * La validación se hace en el controlador porque los alias aceptan varias
 * formas del cuerpo.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {
    private Long senderId;
    private Long receiverId;
    /** Alias en español usado por el frontend (Mensajeria.jsx). */
    private Long destinatarioId;
    private String content;
    /** Alias en español usado por el frontend (Mensajeria.jsx). */
    private String contenido;
    private String texto;

    public Long getReceiverId() {
        if (receiverId != null) {
            return receiverId;
        }
        return destinatarioId;
    }

    public String getContent() {
        if (content != null && !content.isBlank()) {
            return content;
        }
        if (contenido != null && !contenido.isBlank()) {
            return contenido;
        }
        if (texto != null && !texto.isBlank()) {
            return texto;
        }
        return null;
    }
}
