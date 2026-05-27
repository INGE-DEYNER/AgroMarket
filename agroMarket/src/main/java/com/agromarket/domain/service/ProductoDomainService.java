package com.agromarket.domain.service;

import com.agromarket.domain.exception.AccesoDenegadoException;
import com.agromarket.domain.model.RolUsuario;

public class ProductoDomainService {
    public void validarPropiedad(Long solicitanteId, RolUsuario solicitanteRol, Long productorId) {
        boolean esAdmin = solicitanteRol == RolUsuario.ADMINISTRADOR;
        boolean esDueno = solicitanteId != null && productorId != null && productorId.equals(solicitanteId);
        if (!esAdmin && !esDueno) {
            throw new AccesoDenegadoException("Solo el productor dueño o un administrador puede operar el producto");
        }
    }
}
