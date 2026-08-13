package com.agromarket.interfaces.rest.request;

import java.time.LocalDate;

import com.agromarket.domain.models.enums.EstadoEnvio;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarEnvioRequest {
    private String transportista;
    private String guia;
    private LocalDate fechaEstimadaEntrega;
    private EstadoEnvio estado;
}
