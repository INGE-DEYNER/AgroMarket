package com.agromarket.domain.ports;

import java.util.List;

import com.agromarket.application.api.request.CrearResenaRequest;
import com.agromarket.application.api.response.ResenaResponse;

public interface ResenaService {
    ResenaResponse crear(CrearResenaRequest request, Long compradorId);

    List<ResenaResponse> getByProducto(Long productoId);

    void eliminar(Long id, Long solicitanteId);

    List<ResenaResponse> getAll();
}
