package com.agromarket.application.service;

import java.math.BigDecimal;
import java.util.List;

import com.agromarket.application.dto.AdminDashboardResponse;
import com.agromarket.application.dto.PedidoResponse;
import com.agromarket.application.dto.UsuarioResponse;
import com.agromarket.application.mapper.PedidoMapper;
import com.agromarket.application.mapper.UsuarioMapper;
import com.agromarket.infrastructure.persistence.entity.PagoEntity;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.PagoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.PedidoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.ProductoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@SuppressWarnings({"null", "unused"})
public class AdminServiceImpl implements AdminService {
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final ProductoJpaRepository productoJpaRepository;
    private final PedidoJpaRepository pedidoJpaRepository;
    private final PagoJpaRepository pagoJpaRepository;
    private final UsuarioMapper usuarioMapper;
    private final PedidoMapper pedidoMapper;

    @Override
    public AdminDashboardResponse dashboard() {
        BigDecimal ingresos = pagoJpaRepository.findAll().stream()
                .filter(pago -> pago.getEstado() != null && pago.getEstado().name().equals("CONFIRMADO"))
                .map(PagoEntity::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return AdminDashboardResponse.builder()
                .totalUsuarios(usuarioJpaRepository.count())
                .totalProductos(productoJpaRepository.count())
                .totalPedidos(pedidoJpaRepository.count())
                .ingresos(ingresos)
                .build();
    }

    @Override
    public List<PedidoResponse> pedidos() {
        return pedidoMapper.toResponseList(pedidoJpaRepository.findAll());
    }

    @Override
    public List<UsuarioResponse> usuarios() {
        return usuarioMapper.toResponseList(usuarioJpaRepository.findAll());
    }

    @Override
    public void aprobarUsuario(Long id) {
        UsuarioEntity usuario = usuarioJpaRepository.findById(id)
                .orElseThrow(() -> new com.agromarket.domain.exception.RecursoNoEncontradoException("Usuario no encontrado"));
        usuario.setAprobado(true);
        usuario.setActivo(true);
        usuarioJpaRepository.save(usuario);
    }
}
