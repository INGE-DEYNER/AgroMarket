package com.agromarket.domain.model;

import java.math.BigDecimal;
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
public class Pago {
    private Long id;
    private Pedido pedido;
    private BigDecimal monto;
    private MetodoPago metodoPago;
    private EstadoPago estado;
    private String referenciaPasarela;
    private LocalDateTime fechaPago;

    public void confirmar(String referencia) {
        this.estado = EstadoPago.CONFIRMADO;
        this.referenciaPasarela = referencia;
        this.fechaPago = LocalDateTime.now();
    }
}
