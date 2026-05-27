package com.agromarket.domain.service;

import java.math.BigDecimal;

import com.agromarket.domain.exception.EstadoPedidoInvalidoException;
import com.agromarket.domain.model.Pago;
import com.agromarket.domain.model.Pedido;

public class PagoDomainService {
    public void validarMonto(Pedido pedido, BigDecimal monto) {
        if (pedido == null || pedido.getTotal() == null || monto == null || pedido.getTotal().compareTo(monto) != 0) {
            throw new EstadoPedidoInvalidoException("El monto del pago no coincide con el total del pedido");
        }
    }

    public void confirmarPago(Pago pago, String referencia) {
        if (pago == null) {
            throw new EstadoPedidoInvalidoException("Pago inválido");
        }
        pago.confirmar(referencia);
    }
}
