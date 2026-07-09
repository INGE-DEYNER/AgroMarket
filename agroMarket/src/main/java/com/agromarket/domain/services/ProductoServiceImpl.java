package com.agromarket.domain.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import com.agromarket.application.api.request.ActualizarProductoRequest;
import com.agromarket.application.api.request.CrearProductoRequest;
import com.agromarket.application.api.response.PageResponse;
import com.agromarket.application.api.response.ProductoResponse;
import com.agromarket.application.mapper.ProductoMapper;
import com.agromarket.application.persistence.sql.entities.ProductoEntity;
import com.agromarket.application.persistence.sql.entities.ProductorEntity;
import com.agromarket.application.persistence.sql.entities.UsuarioEntity;
import com.agromarket.application.persistence.sql.repositories.ProductoJpaRepository;
import com.agromarket.application.persistence.sql.repositories.UsuarioJpaRepository;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.domain.models.enums.TipoFruta;
import com.agromarket.domain.ports.ProductoService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.infrastructure.security.InputSanitizerService;
import com.github.benmanes.caffeine.cache.Cache;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {
    private final ProductoJpaRepository productoJpaRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final ProductoMapper productoMapper;
    private final InputSanitizerService inputSanitizerService;
    private final ProductoDomainService productoDomainService = new ProductoDomainService();
    private final Cache<Long, Object> productoCache;
    private final Cache<Long, Object> misProductosCache;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductoResponse> getAll(int page, int size, String search, TipoFruta tipo, BigDecimal precioMin, BigDecimal precioMax, String sort, String categoria, Boolean enPromocion) {
        org.springframework.data.domain.Sort sortOrder = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "fechaCreacion");
        if (sort != null) {
            if (sort.equalsIgnoreCase("masVendidos")) {
                sortOrder = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "totalVendido");
            } else if (sort.equalsIgnoreCase("masBaratos")) {
                sortOrder = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "precio");
            } else if (sort.equalsIgnoreCase("menosVendidos")) {
                sortOrder = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "totalVendido");
            } else if (sort.contains(",")) {
                String[] parts = sort.split(",");
                String prop = parts[0];
                String dir = parts[1];
                if (dir.equalsIgnoreCase("desc")) {
                    sortOrder = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, prop);
                } else {
                    sortOrder = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, prop);
                }
            }
        }
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), sortOrder);
        Specification<ProductoEntity> spec = (root, query, cb) -> cb.equal(root.get("activo"), true);

        if (Boolean.TRUE.equals(enPromocion)) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("enPromocion"), true));
        }
        
        if (search != null && !search.isBlank()) {
            String keyword = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("nombre")), keyword));
        }
        if (tipo != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("tipoFruta"), tipo));
        }
        if (categoria != null && !categoria.isBlank()) {
            String cleanCategory = categoria.toLowerCase()
                    .trim()
                    .replace("á", "a")
                    .replace("é", "e")
                    .replace("í", "i")
                    .replace("ó", "o")
                    .replace("ú", "u")
                    .replace("ñ", "n");
            if (cleanCategory.equalsIgnoreCase("otros")) {
                spec = spec.and((root, query, cb) -> cb.equal(root.get("tipoFruta"), TipoFruta.OTRO));
            } else if (cleanCategory.equalsIgnoreCase("frutas")) {
                spec = spec.and((root, query, cb) -> cb.notEqual(root.get("tipoFruta"), TipoFruta.OTRO));
            } else {
                try {
                    TipoFruta tf = TipoFruta.valueOf(cleanCategory.toUpperCase());
                    spec = spec.and((root, query, cb) -> cb.equal(root.get("tipoFruta"), tf));
                } catch (IllegalArgumentException e) {
                    if (!categoria.equalsIgnoreCase("Todos")) {
                        spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("tipoFruta").as(String.class)), "%" + cleanCategory + "%"));
                    }
                }
            }
        }
        if (precioMin != null && precioMax != null) {
            spec = spec.and((root, query, cb) -> cb.between(root.get("precio"), precioMin, precioMax));
        } else if (precioMin != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("precio"), precioMin));
        } else if (precioMax != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("precio"), precioMax));
        }

        Page<ProductoEntity> pageResult = productoJpaRepository.findAll(spec, pageable);
        List<ProductoResponse> content = pageResult.getContent().stream().map(productoMapper::toResponse).collect(Collectors.toList());
        return PageResponse.<ProductoResponse>builder()
                .content(content)
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements((int) pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductoResponse getById(Long id) {
        return (ProductoResponse) productoCache.get(id, k -> {
            ProductoEntity producto = findProducto(id);
            return productoMapper.toResponse(producto);
        });
    }

    @Override
    @Transactional
    public ProductoResponse crear(CrearProductoRequest request, Long productorId) {
        boolean existeDuplicado = productoJpaRepository.existsByNombreIgnoreCaseAndProductorId(request.getNombre(), productorId);
        if (existeDuplicado) {
            throw new IllegalArgumentException("Ya tienes un producto con ese nombre. Usa un nombre diferente o edita el existente.");
        }
        ProductorEntity productor = obtenerProductor(productorId);
        ProductoEntity producto = ProductoEntity.builder()
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
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
        // sanitize inputs
        producto.setNombre(inputSanitizerService.sanitize(producto.getNombre()));
        producto.setDescripcion(inputSanitizerService.sanitize(producto.getDescripcion()));
        ProductoEntity saved = productoJpaRepository.save(producto);
        // invalidate caches
        misProductosCache.invalidateAll();
        productoCache.invalidateAll();
        return productoMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ProductoResponse actualizar(Long id, ActualizarProductoRequest request, Long productorId) {
        ProductoEntity producto = findProducto(id);
        UsuarioEntity solicitante = findUsuario(productorId);
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
        ProductoEntity saved = productoJpaRepository.save(producto);
        // invalidate caches
        productoCache.invalidate(id);
        misProductosCache.invalidateAll();
        return productoMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void eliminar(Long id, Long solicitanteId) {
        ProductoEntity producto = findProducto(id);
        UsuarioEntity solicitante = findUsuario(solicitanteId);
        productoDomainService.validarPropiedad(solicitante.getId(), solicitante.getRol(), producto.getProductor() != null ? producto.getProductor().getId() : null);
        productoJpaRepository.deleteById(id);
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
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<ProductoEntity> pageResult = productoJpaRepository.findByProductorId(productorId, pageable);
        List<ProductoResponse> content = pageResult.getContent().stream().map(productoMapper::toResponse).collect(Collectors.toList());
        PageResponse<ProductoResponse> result = PageResponse.<ProductoResponse>builder()
                .content(content)
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements((int) pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .build();
        misProductosCache.put(key, result);
        return result;
    }

    private ProductorEntity obtenerProductor(Long productorId) {
        UsuarioEntity usuario = findUsuario(productorId);
        if (!(usuario instanceof ProductorEntity productorEntity)) {
            throw new RecursoNoEncontradoException("El usuario no es un productor");
        }
        return productorEntity;
    }

    private UsuarioEntity findUsuario(Long id) {
        return usuarioJpaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
    }

    private ProductoEntity findProducto(Long id) {
        return productoJpaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado"));
    }
}
