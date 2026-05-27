package com.agromarket.application.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.agromarket.application.dto.CrearResenaRequest;
import com.agromarket.application.dto.ResenaResponse;
import com.agromarket.application.mapper.ResenaMapper;
import com.agromarket.domain.exception.AccesoDenegadoException;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.domain.exception.ResenaDuplicadaException;
import com.agromarket.domain.model.RolUsuario;
import com.agromarket.domain.service.ResenaDomainService;
import com.agromarket.infrastructure.persistence.entity.ProductoEntity;
import com.agromarket.infrastructure.persistence.entity.ResenaEntity;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.PedidoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.ProductoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.ResenaJpaRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ResenaServiceImpl implements ResenaService {
    private final ResenaJpaRepository resenaJpaRepository;
    private final ProductoJpaRepository productoJpaRepository;
    private final PedidoJpaRepository pedidoJpaRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final ResenaMapper resenaMapper;
    private final ResenaDomainService resenaDomainService = new ResenaDomainService();

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
        UsuarioEntity comprador = usuarioJpaRepository.findById(compradorId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        ResenaEntity resena = ResenaEntity.builder()
                .comprador((com.agromarket.infrastructure.persistence.entity.CompradorEntity) comprador)
                .producto(producto)
                .calificacion(request.getCalificacion())
                .comentario(request.getComentario())
                .fecha(LocalDateTime.now())
                .build();
        return resenaMapper.toResponse(resenaJpaRepository.save(resena));
    }

    @Override
    public List<ResenaResponse> getByProducto(Long productoId) {
        return resenaMapper.toResponseList(resenaJpaRepository.findByProductoId(productoId));
    }

    @Override
    public void eliminar(Long id, Long solicitanteId) {
        ResenaEntity resena = resenaJpaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reseña no encontrada"));
        UsuarioEntity usuario = usuarioJpaRepository.findById(solicitanteId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        boolean esAdmin = usuario.getRol() == RolUsuario.ADMINISTRADOR;
        boolean esDueno = resena.getComprador() != null && resena.getComprador().getId() != null && resena.getComprador().getId().equals(solicitanteId);
        if (!esAdmin && !esDueno) {
            throw new AccesoDenegadoException("No tiene permisos para eliminar esta reseña");
        }
        resenaJpaRepository.deleteById(id);
    }
}
