package com.agromarket.domain.ports;

import java.math.BigDecimal;

import com.agromarket.application.api.request.ActualizarProductoRequest;
import com.agromarket.application.api.request.CrearProductoRequest;
import com.agromarket.application.api.response.PageResponse;
import com.agromarket.application.api.response.ProductoResponse;
import com.agromarket.domain.models.enums.TipoFruta;

public interface ProductoService {
    PageResponse<ProductoResponse> getAll(int page, int size, String search, TipoFruta tipo, BigDecimal precioMin, BigDecimal precioMax, String sort, String categoria, Boolean enPromocion);

    ProductoResponse getById(Long id);

    ProductoResponse crear(CrearProductoRequest request, Long productorId);

    ProductoResponse actualizar(Long id, ActualizarProductoRequest request, Long productorId);

    void eliminar(Long id, Long solicitanteId);

    PageResponse<ProductoResponse> getMisProductos(Long productorId, int page, int size);
}
