package com.agromarket.application.service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import com.agromarket.application.dto.ActualizarProductoRequest;
import com.agromarket.application.dto.CrearProductoRequest;
import com.agromarket.application.dto.PageResponse;
import com.agromarket.application.dto.ProductoResponse;
import com.agromarket.application.mapper.ProductoMapper;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.domain.model.RolUsuario;
import com.agromarket.domain.model.TipoFruta;
import com.agromarket.domain.service.ProductoDomainService;
import com.agromarket.infrastructure.persistence.entity.ProductoEntity;
import com.agromarket.infrastructure.persistence.entity.ProductorEntity;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.ProductoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {
    private final ProductoJpaRepository productoJpaRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final ProductoMapper productoMapper;
    private final ProductoDomainService productoDomainService = new ProductoDomainService();

    @Override
    public PageResponse<ProductoResponse> getAll(int page, int size, String search, TipoFruta tipo, BigDecimal precioMin, BigDecimal precioMax) {
        List<ProductoEntity> productos = productoJpaRepository.findAll();
        if (search != null && !search.isBlank()) {
            String keyword = search.toLowerCase();
            productos = productos.stream()
                    .filter(producto -> producto.getNombre() != null && producto.getNombre().toLowerCase().contains(keyword))
                    .collect(Collectors.toList());
        }
        if (tipo != null) {
            productos = productos.stream().filter(producto -> tipo.equals(producto.getTipoFruta())).collect(Collectors.toList());
        }
        if (precioMin != null) {
            productos = productos.stream().filter(producto -> producto.getPrecio() != null && producto.getPrecio().compareTo(precioMin) >= 0).collect(Collectors.toList());
        }
        if (precioMax != null) {
            productos = productos.stream().filter(producto -> producto.getPrecio() != null && producto.getPrecio().compareTo(precioMax) <= 0).collect(Collectors.toList());
        }
        productos = productos.stream().sorted(Comparator.comparing(ProductoEntity::getFechaCreacion, Comparator.nullsLast(Comparator.reverseOrder()))).collect(Collectors.toList());
        return paginate(productos.stream().filter(producto -> producto.isActivo()).collect(Collectors.toList()), page, size);
    }

    @Override
    public ProductoResponse getById(Long id) {
        return productoMapper.toResponse(findProducto(id));
    }

    @Override
    public ProductoResponse crear(CrearProductoRequest request, Long productorId) {
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
                .activo(true)
                .build();
        return productoMapper.toResponse(productoJpaRepository.save(producto));
    }

    @Override
    public ProductoResponse actualizar(Long id, ActualizarProductoRequest request, Long productorId) {
        ProductoEntity producto = findProducto(id);
        UsuarioEntity solicitante = findUsuario(productorId);
        productoDomainService.validarPropiedad(solicitante.getId(), solicitante.getRol(), producto.getProductor() != null ? producto.getProductor().getId() : null);
        if (request.getNombre() != null) {
            producto.setNombre(request.getNombre());
        }
        if (request.getDescripcion() != null) {
            producto.setDescripcion(request.getDescripcion());
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
        return productoMapper.toResponse(productoJpaRepository.save(producto));
    }

    @Override
    public void eliminar(Long id, Long solicitanteId) {
        ProductoEntity producto = findProducto(id);
        UsuarioEntity solicitante = findUsuario(solicitanteId);
        productoDomainService.validarPropiedad(solicitante.getId(), solicitante.getRol(), producto.getProductor() != null ? producto.getProductor().getId() : null);
        productoJpaRepository.deleteById(id);
    }

    @Override
    public PageResponse<ProductoResponse> getMisProductos(Long productorId, int page, int size) {
        List<ProductoEntity> productos = productoJpaRepository.findByProductorId(productorId);
        return paginate(productos, page, size);
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

    private PageResponse<ProductoResponse> paginate(List<ProductoEntity> productos, int page, int size) {
        int totalElements = productos.size();
        int fromIndex = Math.min(page * size, totalElements);
        int toIndex = Math.min(fromIndex + size, totalElements);
        List<ProductoResponse> content = productos.subList(fromIndex, toIndex).stream().map(productoMapper::toResponse).collect(Collectors.toList());
        int totalPages = size == 0 ? 0 : (int) Math.ceil((double) totalElements / size);
        return PageResponse.<ProductoResponse>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .build();
    }
}
