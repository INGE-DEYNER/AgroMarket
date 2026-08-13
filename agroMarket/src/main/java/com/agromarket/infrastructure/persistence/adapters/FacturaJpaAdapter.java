package com.agromarket.infrastructure.persistence.adapters;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.agromarket.domain.models.Factura;
import com.agromarket.domain.ports.out.InvoiceRepositoryPort;
import com.agromarket.infrastructure.persistence.mapper.FacturaMapper;
import com.agromarket.infrastructure.persistence.sql.entities.FacturaEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.FacturaJpaRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class FacturaJpaAdapter implements InvoiceRepositoryPort {

    private final FacturaJpaRepository facturaJpaRepository;
    private final FacturaMapper facturaMapper;

    @Override
    public Optional<Factura> findById(Long id) {
        return facturaJpaRepository.findById(id).map(facturaMapper::toDomain);
    }

    @Override
    public Optional<Factura> findByOrderId(Long orderId) {
        return facturaJpaRepository.findByPedidoId(orderId).map(facturaMapper::toDomain);
    }

    @Override
    public Factura save(Factura invoice) {
        FacturaEntity entity = facturaMapper.toEntity(invoice);
        FacturaEntity savedEntity = facturaJpaRepository.save(entity);
        return facturaMapper.toDomain(savedEntity);
    }

    @Override
    public List<Factura> findAll() {
        return facturaJpaRepository.findAll().stream()
                .map(facturaMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Factura> findByBuyerId(Long buyerId) {
        return facturaJpaRepository.findByPedidoCompradorId(buyerId).stream()
                .map(facturaMapper::toDomain)
                .collect(Collectors.toList());
    }
}
