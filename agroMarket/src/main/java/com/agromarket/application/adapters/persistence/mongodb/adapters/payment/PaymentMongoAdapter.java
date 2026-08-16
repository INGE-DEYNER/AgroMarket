package com.agromarket.application.adapters.persistence.mongodb.adapters.payment;

import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.agromarket.application.adapters.persistence.mongodb.documents.payment.PaymentDocument;
import com.agromarket.application.adapters.persistence.mongodb.repositories.payment.PaymentMongoRepository;
import com.agromarket.domain.models.payment.Payment;
import com.agromarket.domain.ports.out.payment.PaymentPort;

import lombok.RequiredArgsConstructor;

@Component
@Profile("mongo")
@RequiredArgsConstructor
public class PaymentMongoAdapter implements PaymentPort {

    private final PaymentMongoRepository repository;

    @Override
    public Payment save(Payment payment) {
        return repository.save(PaymentDocument.fromDomain(payment))
                .toDomain();
    }

    @Override
    public Optional<Payment> findById(Long id) {
        return repository.findById(id.toString())
                .map(PaymentDocument::toDomain);
    }

    @Override
    public List<Payment> findByOrderId(Long orderId) {
        return repository.findByOrderId(orderId)
                .stream()
                .map(PaymentDocument::toDomain)
                .toList();
    }

    @Override
    public boolean existsById(Long id) {
        return repository.existsById(id.toString());
    }
}
