package com.agromarket.application.usecases;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import com.agromarket.interfaces.rest.request.ActualizarProductoRequest;
import com.agromarket.interfaces.rest.request.CrearProductoRequest;
import com.agromarket.interfaces.rest.response.PageResponse;
import com.agromarket.interfaces.rest.response.ProductoResponse;
import com.agromarket.infrastructure.persistence.mapper.ProductoMapper;
import com.agromarket.domain.models.Producto;
import com.agromarket.domain.models.Productor;
import com.agromarket.domain.models.Usuario;
import com.agromarket.domain.ports.out.ProductRepositoryPort;
import com.agromarket.domain.ports.out.UserRepositoryPort;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.domain.models.enums.TipoFruta;
import com.agromarket.application.ports.in.ProductoService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.infrastructure.security.InputSanitizerService;
import com.github.benmanes.caffeine.cache.Cache;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {
    private final ProductRepositoryPort productRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;
    private final ProductoMapper productoMapper;
    private final InputSanitizerService inputSanitizerService;
    private final ProductoDomainService productoDomainService = new ProductoDomainService();
    private final Cache<Long, Object> productoCache;
    private final Cache<Long, Object> misProductosCache;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductoResponse> getAll(int page, int size, String search, TipoFruta tipo, BigDecimal precioMin, BigDecimal precioMax, String sort, String categoria, Boolean enPromocion) {
        String cleanCategory = categoria;
        if (categoria != null && !categoria.isBlank()) {
            cleanCategory = categoria.toLowerCase()
                    .trim()
                    .replace("á", "a")
                    .replace("é", "e")
                    .replace("í", "i")
                    .replace("ó", "o")
                    .replace("ú", "u")
                    .replace("ñ", "n");
        }
        
        List<Producto> productos = productRepositoryPort.findAll(page, size, search, tipo, precioMin, precioMax, sort, cleanCategory, enPromocion);
        long totalElements = productRepositoryPort.countAll(search, tipo, precioMin, precioMax, cleanCategory, enPromocion);
        
        List<ProductoResponse> content = productos.stream().map(productoMapper::toResponse).collect(Collectors.toList());
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        return PageResponse.<ProductoResponse>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements((int) totalElements)
                .totalPages(totalPages)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductoResponse getById(Long id) {
        return (ProductoResponse) productoCache.get(id, k -> {
            Producto producto = findProducto(id);
            return productoMapper.toResponse(producto);
        });
    }

    @Override
    @Transactional
    public ProductoResponse crear(CrearProductoRequest request, Long productorId) {
        boolean existeDuplicado = productRepositoryPort.existsByNameAndProducerId(request.getNombre(), productorId);
        if (existeDuplicado) {
            throw new IllegalArgumentException("Ya tienes un producto con ese nombre. Usa un nombre diferente o edita el existente.");
        }
        Productor productor = obtenerProductor(productorId);
        Producto producto = Producto.builder()
                .nombre(inputSanitizerService.sanitize(request.getNombre()))
                .descripcion(inputSanitizerService.sanitize(request.getDescripcion()))
                .precio(request.getPrecio())
                .cantidadDisponible(request.getCantidadDisponible())
                .imagenUrl(request.getImagenUrl())
                .tipoFruta(request.getTipoFruta())
                .productor(productor)
                .enPromocion(request.isEnPromocion())
                .cantidadMinimaMayorista(request.getCantidadMinimaMayorista())
                .precioMayorista(request.getPrecioMayorista())
                .activo(true)
                .build();
                
        Producto saved = productRepositoryPort.save(producto);
        // invalidate caches
        misProductosCache.invalidateAll();
        productoCache.invalidateAll();
        return productoMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ProductoResponse actualizar(Long id, ActualizarProductoRequest request, Long productorId) {
        Producto producto = findProducto(id);
        Usuario solicitante = findUsuario(productorId);
        productoDomainService.validarPropiedad(solicitante.getId(), solicitante.getRol(), producto.getProductor() != null ? producto.getProductor().getId() : null);
        
        if (request.getNombre() != null) {
            producto.setNombre(inputSanitizerService.sanitize(request.getNombre()));
        }
        if (request.getDescripcion() != null) {
            producto.setDescripcion(inputSanitizerService.sanitize(request.getDescripcion()));
        }
        if (request.getPrecio() != null) {
            producto.setPrecio(request.getPrecio());
        }
        if (request.getCantidadDisponible() != null) {
            producto.setCantidadDisponible(request.getCantidadDisponible());
        }
        if (request.getImagenUrl() != null) {
            producto.setImagenUrl(request.getImagenUrl());
        }
        if (request.getTipoFruta() != null) {
            producto.setTipoFruta(request.getTipoFruta());
        }
        if (request.getEnPromocion() != null) {
            producto.setEnPromocion(request.getEnPromocion());
        }
        if (request.getActivo() != null) {
            producto.setActivo(request.getActivo());
        }
        if (request.getCantidadMinimaMayorista() != null) {
            producto.setCantidadMinimaMayorista(request.getCantidadMinimaMayorista());
        }
        if (request.getPrecioMayorista() != null) {
            producto.setPrecioMayorista(request.getPrecioMayorista());
        }
        Producto saved = productRepositoryPort.save(producto);
        // invalidate caches
        productoCache.invalidate(id);
        misProductosCache.invalidateAll();
        return productoMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void eliminar(Long id, Long solicitanteId) {
        Producto producto = findProducto(id);
        Usuario solicitante = findUsuario(solicitanteId);
        productoDomainService.validarPropiedad(solicitante.getId(), solicitante.getRol(), producto.getProductor() != null ? producto.getProductor().getId() : null);
        productRepositoryPort.deleteById(id);
        // invalidate caches
        productoCache.invalidate(id);
        misProductosCache.invalidateAll();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductoResponse> getMisProductos(Long productorId, int page, int size) {
        Long key = productorId;
        @SuppressWarnings("unchecked")
        PageResponse<ProductoResponse> cached = (PageResponse<ProductoResponse>) misProductosCache.getIfPresent(key);
        if (cached != null) {
            return cached;
        }
        
        List<Producto> productos = productRepositoryPort.findByProducerId(productorId, page, size);
        long totalElements = productRepositoryPort.countByProducerId(productorId);
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        List<ProductoResponse> content = productos.stream().map(productoMapper::toResponse).collect(Collectors.toList());
        PageResponse<ProductoResponse> result = PageResponse.<ProductoResponse>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements((int) totalElements)
                .totalPages(totalPages)
                .build();
        misProductosCache.put(key, result);
        return result;
    }

    private Productor obtenerProductor(Long productorId) {
        Usuario usuario = findUsuario(productorId);
        if (!(usuario instanceof Productor productor)) {
            throw new RecursoNoEncontradoException("El usuario no es un productor");
        }
        return productor;
    }

    private Usuario findUsuario(Long id) {
        return userRepositoryPort.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
    }

    private Producto findProducto(Long id) {
        return productRepositoryPort.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado"));
    }
}
