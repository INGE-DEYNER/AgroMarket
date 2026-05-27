package com.agromarket.application.dto;

import java.time.LocalDate;

import com.agromarket.domain.model.EstadoEnvio;

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
