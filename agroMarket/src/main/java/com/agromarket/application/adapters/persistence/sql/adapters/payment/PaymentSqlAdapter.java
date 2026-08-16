package com.agromarket.application.adapters.persistence.sql.adapters.payment;

import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.agromarket.application.adapters.persistence.sql.entities.order.OrderEntity;
import com.agromarket.application.adapters.persistence.sql.entities.payment.PaymentEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.payment.PaymentJpaRepository;
import com.agromarket.domain.models.payment.Payment;
import com.agromarket.domain.ports.out.payment.PaymentPort;

import lombok.RequiredArgsConstructor;

@Component
@Profile("sql")
@RequiredArgsConstructor
public class PaymentSqlAdapter implements PaymentPort {

    private final PaymentJpaRepository repository;

    @Override
    public Payment save(Payment payment) {
        Long orderId = payment.getOrder() != null
                ? payment.getOrder().getId()
                : null;

        if (orderId == null) {
            throw new IllegalArgumentException(
                    "El pago debe tener un orderId");
        }

        OrderEntity orderReference = OrderEntity.builder()
                .id(orderId)
                .build();

        return repository.save(
                PaymentEntity.fromDomain(payment, orderReference))
                .toDomain();
    }

    @Override
    public Optional<Payment> findById(Long id) {
        return repository.findById(id)
                .map(PaymentEntity::toDomain);
    }

    @Override
    public List<Payment> findByOrderId(Long orderId) {
        return repository.findByOrder_Id(orderId)
                .stream()
                .map(PaymentEntity::toDomain)
                .toList();
    }

    @Override
    public boolean existsById(Long id) {
        return repository.existsById(id);
    }
}
