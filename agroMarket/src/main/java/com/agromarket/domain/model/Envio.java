package com.agromarket.domain.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Envio {
    private Long id;
    private Pedido pedido;
    private String direccionDestino;
    private EstadoEnvio estado;
    private String transportista;
    private String guia;
    private LocalDate fechaEstimadaEntrega;
    private String origen = "Chigorodó, Antioquia";
    private LocalDateTime fechaCreacion;

    public void avanzarEstado() {
        if (estado == EstadoEnvio.PREPARANDO) {
            estado = EstadoEnvio.EN_CAMINO;
            return;
        }
        if (estado == EstadoEnvio.EN_CAMINO) {
            estado = EstadoEnvio.ENTREGADO;
        }
    }
}
