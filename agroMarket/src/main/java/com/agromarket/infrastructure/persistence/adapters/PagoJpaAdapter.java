package com.agromarket.infrastructure.persistence.adapters;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.agromarket.domain.models.Pago;
import com.agromarket.domain.models.enums.EstadoPago;
import com.agromarket.domain.ports.out.PaymentRepositoryPort;
import com.agromarket.infrastructure.persistence.mapper.PagoMapper;
import com.agromarket.infrastructure.persistence.sql.entities.PagoEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.PagoJpaRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PagoJpaAdapter implements PaymentRepositoryPort {

    private final PagoJpaRepository pagoJpaRepository;
    private final PagoMapper pagoMapper;

    @Override
    public Optional<Pago> findById(Long id) {
        return pagoJpaRepository.findById(id).map(pagoMapper::toDomain);
    }

    @Override
    public Optional<Pago> findByGatewayReference(String reference) {
        return pagoJpaRepository.findByReferenciaPasarela(reference).map(pagoMapper::toDomain);
    }

    @Override
    public Pago save(Pago payment) {
        PagoEntity entity = pagoMapper.toEntity(payment);
        PagoEntity savedEntity = pagoJpaRepository.save(entity);
        return pagoMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Pago> findByOrderId(Long orderId) {
        return pagoJpaRepository.findByPedidoId(orderId).map(pagoMapper::toDomain);
    }

    @Override
    public void delete(Pago payment) {
        pagoJpaRepository.delete(pagoMapper.toEntity(payment));
    }

    @Override
    public BigDecimal sumConfirmedAmount() {
        return pagoJpaRepository.sumMontoConfirmado();
    }

    @Override
    public List<Pago> findByStatus(EstadoPago status) {
        return pagoJpaRepository.findByEstado(status).stream()
                .map(pagoMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Pago> findAll() {
        return pagoJpaRepository.findAll().stream()
                .map(pagoMapper::toDomain)
                .collect(Collectors.toList());
    }
}
