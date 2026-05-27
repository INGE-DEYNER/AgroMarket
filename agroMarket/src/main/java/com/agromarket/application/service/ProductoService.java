package com.agromarket.application.service;

import java.math.BigDecimal;

import com.agromarket.application.dto.ActualizarProductoRequest;
import com.agromarket.application.dto.CrearProductoRequest;
import com.agromarket.application.dto.PageResponse;
import com.agromarket.application.dto.ProductoResponse;
import com.agromarket.domain.model.TipoFruta;

public interface ProductoService {
    PageResponse<ProductoResponse> getAll(int page, int size, String search, TipoFruta tipo, BigDecimal precioMin, BigDecimal precioMax);

    ProductoResponse getById(Long id);

    ProductoResponse crear(CrearProductoRequest request, Long productorId);

    ProductoResponse actualizar(Long id, ActualizarProductoRequest request, Long productorId);

    void eliminar(Long id, Long solicitanteId);

    PageResponse<ProductoResponse> getMisProductos(Long productorId, int page, int size);
}
