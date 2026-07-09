package com.agromarket.domain.models;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
public class Factura {
    private Long id;
    private Pedido pedido;
    private BigDecimal subtotal;
    private BigDecimal impuesto;
    private BigDecimal total;
    private LocalDateTime fechaEmision;
    private String numeroFactura;

    public String generarNumeroFactura() {
        Long facturaId = id == null ? 0L : id;
        int anio = LocalDateTime.now().getYear();
        this.numeroFactura = "FAC-" + facturaId + "-" + anio;
        return numeroFactura;
    }

    public void calcularValores(BigDecimal subtotal) {
        this.subtotal = subtotal;
        this.impuesto = subtotal.multiply(BigDecimal.valueOf(0.19)).setScale(2, RoundingMode.HALF_UP);
        this.total = subtotal.add(impuesto).setScale(2, RoundingMode.HALF_UP);
    }
}
