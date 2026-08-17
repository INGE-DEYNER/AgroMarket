package com.agromarket.application.adapters.persistence.mongodb.adapters.payment;

import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.agromarket.application.adapters.persistence.mongodb.documents.payment.InvoiceDocument;
import com.agromarket.application.adapters.persistence.mongodb.repositories.payment.InvoiceMongoRepository;
import com.agromarket.domain.models.payment.Invoice;
import com.agromarket.domain.ports.out.payment.InvoicePort;

import lombok.RequiredArgsConstructor;

@Component
@Profile("mongo")
@RequiredArgsConstructor
public class InvoiceMongoAdapter implements InvoicePort {

    private final InvoiceMongoRepository repository;

    @Override
    public Invoice save(Invoice invoice) {
        return repository.save(InvoiceDocument.fromDomain(invoice))
                .toDomain();
    }

    @Override
    public Optional<Invoice> findByOrderId(Long orderId) {
        return repository.findByOrderId(orderId)
                .map(entity -> entity.toDomain());
    }

    @Override
    public Optional<Invoice> findById(Long id) {
        return repository.findById(id.toString())
                .map(entity -> entity.toDomain());
    }
}
