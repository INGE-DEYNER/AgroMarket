package com.agromarket.domain.ports;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import com.agromarket.application.persistence.sql.entities.CuponDescuento;

public interface CuponDescuentoService {
    CuponDescuento generarCuponPrimerEnvio(Long usuarioId);
    Map<String, Object> validarCupon(String codigo, BigDecimal totalPedido);
    List<CuponDescuento> obtenerCuponesUsuario(Long usuarioId);
}
