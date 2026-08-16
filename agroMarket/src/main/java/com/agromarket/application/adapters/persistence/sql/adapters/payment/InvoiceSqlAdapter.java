package com.agromarket.application.adapters.persistence.sql.adapters.payment;

import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.agromarket.application.adapters.persistence.sql.entities.order.OrderEntity;
import com.agromarket.application.adapters.persistence.sql.entities.payment.InvoiceEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.payment.InvoiceJpaRepository;
import com.agromarket.domain.models.payment.Invoice;
import com.agromarket.domain.ports.out.payment.InvoicePort;

import lombok.RequiredArgsConstructor;

@Component
@Profile("sql")
@RequiredArgsConstructor
public class InvoiceSqlAdapter implements InvoicePort {

        private final InvoiceJpaRepository repository;

        @Override
        public Invoice save(Invoice invoice) {
                Long orderId = invoice.getOrder() != null
                                ? invoice.getOrder().getId()
                                : null;

                if (orderId == null) {
                        throw new IllegalArgumentException(
                                        "La factura debe tener un orderId");
                }

                OrderEntity orderReference = OrderEntity.builder()
                                .id(orderId)
                                .build();

                return repository.save(
                                InvoiceEntity.fromDomain(invoice, orderReference))
                                .toDomain();
        }

        @Override
        public Optional<Invoice> findByOrderId(Long orderId) {
                return repository.findByOrder_Id(orderId)
                                .map(InvoiceEntity::toDomain);
        }

        @Override
        public Optional<Invoice> findById(Long id) {
                return repository.findById(id)
                                .map(InvoiceEntity::toDomain);
        }
}
