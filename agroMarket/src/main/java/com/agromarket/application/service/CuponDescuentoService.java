package com.agromarket.application.service;

import com.agromarket.infrastructure.persistence.entity.CuponDescuento;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface CuponDescuentoService {
    CuponDescuento generarCuponPrimerEnvio(Long usuarioId);
    Map<String, Object> validarCupon(String codigo, BigDecimal totalPedido);
    List<CuponDescuento> obtenerCuponesUsuario(Long usuarioId);
}
