package com.agromarket.interfaces.rest.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnviarMensajeRequest {
    @NotNull(message = "El ID del destinatario es obligatorio")
    private Long destinatarioId;

    @NotBlank(message = "El contenido del mensaje es obligatorio")
    @Size(min = 1, max = 1000, message = "El mensaje debe tener entre 1 y 1000 caracteres")
    private String contenido;
}
