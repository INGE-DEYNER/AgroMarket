package com.agromarket.application.service;

import java.time.LocalDateTime;
import java.util.List;

import com.agromarket.application.dto.CrearResenaRequest;
import com.agromarket.application.dto.ResenaResponse;
import com.agromarket.application.mapper.ResenaMapper;
import com.agromarket.domain.exception.AccesoDenegadoException;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.domain.exception.ResenaDuplicadaException;
import com.agromarket.infrastructure.persistence.entity.CompradorEntity;
import com.agromarket.infrastructure.persistence.entity.ProductoEntity;
import com.agromarket.infrastructure.persistence.entity.ResenaEntity;
import com.agromarket.infrastructure.persistence.repository.CompradorJpaRepository;
import com.agromarket.infrastructure.persistence.repository.ProductoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.ResenaJpaRepository;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.infrastructure.security.InputSanitizerService;
import com.github.benmanes.caffeine.cache.Cache;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ResenaServiceImpl implements ResenaService {
    private final ResenaJpaRepository resenaJpaRepository;
    private final ProductoJpaRepository productoJpaRepository;
    private final CompradorJpaRepository compradorJpaRepository;
    private final com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository usuarioJpaRepository;
    private final ResenaMapper resenaMapper;
    private final InputSanitizerService inputSanitizerService;
    private final Cache<Long, Object> resenaCache;

    @Override
    public ResenaResponse crear(CrearResenaRequest request, Long compradorId) {
        ProductoEntity producto = productoJpaRepository.findById(request.getProductoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado"));
        if (resenaJpaRepository.existsByCompradorIdAndProductoId(compradorId, request.getProductoId())) {
            throw new ResenaDuplicadaException("Ya existe una reseña para este producto");
        }
        if (!resenaJpaRepository.tieneEntregado(compradorId, request.getProductoId())) {
            throw new AccesoDenegadoException("Se requiere al menos un pedido entregado para reseñar");
        }
        CompradorEntity comprador = compradorJpaRepository.findById(compradorId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Comprador no encontrado"));
        
        ResenaEntity resena = ResenaEntity.builder()
                .comprador(comprador)
                .producto(producto)
                .calificacion(request.getCalificacion())
                .comentario(inputSanitizerService.sanitize(request.getComentario()))
                .fecha(LocalDateTime.now())
                .build();
        ResenaEntity saved = resenaJpaRepository.save(resena);
        resenaCache.invalidate(request.getProductoId());
        return resenaMapper.toResponse(saved);
    }

    @Override
    public List<ResenaResponse> getByProducto(Long productoId) {
        @SuppressWarnings("unchecked")
        List<ResenaResponse> cached = (List<ResenaResponse>) resenaCache.getIfPresent(productoId);
        if (cached != null) {
            return cached;
        }
        List<ResenaResponse> result = resenaMapper.toResponseList(resenaJpaRepository.findByProductoId(productoId));
        resenaCache.put(productoId, result);
        return result;
    }

    @Override
    public void eliminar(Long id, Long solicitanteId) {
        ResenaEntity resena = resenaJpaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reseña no encontrada"));
        boolean esAdmin = usuarioJpaRepository.findById(solicitanteId)
                .map(u -> u.getRol() == com.agromarket.domain.model.RolUsuario.ADMINISTRADOR)
                .orElse(false);
        boolean esDueno = resena.getComprador() != null && resena.getComprador().getId() != null && resena.getComprador().getId().equals(solicitanteId);
        if (!esAdmin && !esDueno) {
            throw new AccesoDenegadoException("No tiene permisos para eliminar esta reseña");
        }
        resenaJpaRepository.deleteById(id);
        if (resena.getProducto() != null) {
            resenaCache.invalidate(resena.getProducto().getId());
        }
    }

    @Override
    public List<ResenaResponse> getAll() {
        return resenaMapper.toResponseList(resenaJpaRepository.findAll(Sort.by(Sort.Direction.DESC, "fecha")));
    }
}
