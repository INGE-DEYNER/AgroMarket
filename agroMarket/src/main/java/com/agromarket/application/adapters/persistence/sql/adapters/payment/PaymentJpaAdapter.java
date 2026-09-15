package com.agromarket.application.adapters.persistence.sql.adapters.payment;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.application.adapters.persistence.sql.entities.order.OrderEntity;
import com.agromarket.application.adapters.persistence.sql.entities.payment.PaymentEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.order.OrderJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.payment.PaymentJpaRepository;
import com.agromarket.domain.models.payment.Payment;
import com.agromarket.domain.ports.out.payment.PaymentPort;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
@Transactional
public class PaymentJpaAdapter implements PaymentPort {

    private final PaymentJpaRepository repository;
    private final OrderJpaRepository orderRepository;

    @Override
    public Payment save(Payment payment) {

        OrderEntity order = null;

        if (payment.getOrder() != null
                && payment.getOrder().getId() != null) {

            order = orderRepository.findById(payment.getOrder().getId())
                    .orElseThrow(() ->
                            new IllegalArgumentException("Pedido no encontrado"));
        }

        return repository.save(
                PaymentEntity.fromDomain(payment, order)
        ).toDomain();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Payment> findById(Long id) {

        return repository.findById(id)
                .map(PaymentEntity::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Payment> findByOrderId(Long orderId) {

        return repository.findByOrder_Id(orderId)
                .stream()
                .map(PaymentEntity::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsById(Long id) {

        return repository.existsById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Payment> findByGatewayReference(
            String gatewayReference) {

        return repository.findByGatewayReference(gatewayReference)
                .map(PaymentEntity::toDomain);
    }
}
