package com.agromarket.application.ports.in;

import java.util.List;

import com.agromarket.interfaces.rest.request.CrearResenaRequest;
import com.agromarket.interfaces.rest.response.ResenaResponse;

public interface ResenaService {
    ResenaResponse crear(CrearResenaRequest request, Long compradorId);

    List<ResenaResponse> getByProducto(Long productoId);

    void eliminar(Long id, Long solicitanteId);

    List<ResenaResponse> getAll();
}
