package com.agromarket.domain.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

import com.agromarket.domain.model.Factura;

public class FacturaDomainService {
    public BigDecimal calcularImpuesto(BigDecimal subtotal) {
        if (subtotal == null) {
            return BigDecimal.ZERO;
        }
        return subtotal.multiply(BigDecimal.valueOf(0.19)).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calcularTotal(BigDecimal subtotal) {
        BigDecimal impuesto = calcularImpuesto(subtotal);
        return subtotal.add(impuesto).setScale(2, RoundingMode.HALF_UP);
    }

    public void prepararFactura(Factura factura, BigDecimal subtotal) {
        factura.calcularValores(subtotal);
        factura.generarNumeroFactura();
    }
}
