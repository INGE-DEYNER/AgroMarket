package com.agromarket.application.service;

import com.agromarket.application.dto.FacturaResponse;
import com.agromarket.application.mapper.FacturaMapper;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.infrastructure.persistence.entity.FacturaEntity;
import com.agromarket.infrastructure.persistence.repository.FacturaJpaRepository;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FacturaServiceImpl implements FacturaService {
    private final FacturaJpaRepository facturaJpaRepository;
    private final FacturaMapper facturaMapper;

    @Override
    public FacturaResponse getByPedidoId(Long pedidoId) {
        FacturaEntity factura = facturaJpaRepository.findByPedidoId(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Factura no encontrada"));
        return facturaMapper.toResponse(factura);
    }

    @Override
    public FacturaResponse getById(Long id) {
        FacturaEntity factura = facturaJpaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Factura no encontrada"));
        return facturaMapper.toResponse(factura);
    }
}
