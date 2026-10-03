package com.agromarket.application.adapters.api.request.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Cuerpo de POST /tickets/{id}/mensajes. Acepta {@code contenido} y
 * {@code content}.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketMessageRequest {

    private String contenido;
    private String content;

    public String getContent() {
        if (content != null && !content.isBlank()) {
            return content;
        }
        return contenido;
    }
}
