package com.agromarket.interfaces.rest.response;

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
public class EnvioResponse {
    private Long id;
    private Long pedidoId;
    private String origen;
    private String direccionDestino;
    private EstadoEnvio estado;
    private String transportista;
    private String guia;
    private LocalDate fechaEstimadaEntrega;
}
