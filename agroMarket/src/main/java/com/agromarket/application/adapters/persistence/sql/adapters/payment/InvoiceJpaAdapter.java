package com.agromarket.application.adapters.persistence.sql.adapters.payment;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.application.adapters.persistence.sql.entities.order.OrderEntity;
import com.agromarket.application.adapters.persistence.sql.entities.payment.InvoiceEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.order.OrderJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.payment.InvoiceJpaRepository;
import com.agromarket.domain.models.payment.Invoice;
import com.agromarket.domain.ports.out.payment.InvoicePort;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
@Transactional
public class InvoiceJpaAdapter implements InvoicePort {

    private final InvoiceJpaRepository repository;
    private final OrderJpaRepository orderRepository;

    @Override
    public Invoice save(Invoice invoice) {

        OrderEntity order = orderRepository.findById(
                invoice.getOrder().getId()
        ).orElseThrow(() ->
                new IllegalArgumentException("Pedido no encontrado"));

        return repository.save(
                InvoiceEntity.fromDomain(invoice, order)
        ).toDomain();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Invoice> findByUserId(Long userId) {

        return repository.findByUserId(userId)
                .stream()
                .map(InvoiceEntity::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Invoice> findByOrderId(Long orderId) {

        return repository.findByOrder_Id(orderId)
                .map(InvoiceEntity::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Invoice> findById(Long id) {

        return repository.findById(id)
                .map(InvoiceEntity::toDomain);
    }
}
