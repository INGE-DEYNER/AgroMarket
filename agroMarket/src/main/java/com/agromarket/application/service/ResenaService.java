package com.agromarket.application.service;

import java.util.List;

import com.agromarket.application.dto.CrearResenaRequest;
import com.agromarket.application.dto.ResenaResponse;

public interface ResenaService {
    ResenaResponse crear(CrearResenaRequest request, Long compradorId);

    List<ResenaResponse> getByProducto(Long productoId);

    void eliminar(Long id, Long solicitanteId);
}
