package com.agromarket.application.adapters.api.request.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Cuerpo de POST /tickets. Acepta el formato del frontend
 * ({@code asunto, descripcion}) y los nombres en inglés.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTicketRequest {

    private String asunto;
    private String descripcion;
    private String subject;
    private String description;

    public String getSubject() {
        if (subject != null && !subject.isBlank()) {
            return subject;
        }
        return asunto;
    }

    public String getDescription() {
        if (description != null && !description.isBlank()) {
            return description;
        }
        return descripcion;
    }
}
