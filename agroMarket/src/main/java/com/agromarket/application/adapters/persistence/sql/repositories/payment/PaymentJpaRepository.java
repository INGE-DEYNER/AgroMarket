package com.agromarket.application.adapters.persistence.sql.repositories.payment;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.adapters.persistence.sql.entities.payment.PaymentEntity;
import com.agromarket.domain.models.enums.payment.PaymentState;

public interface PaymentJpaRepository
        extends JpaRepository<PaymentEntity, Long> {

    List<PaymentEntity> findByOrder_Id(Long orderId);

    Optional<PaymentEntity> findByGatewayReference(String gatewayReference);

    List<PaymentEntity> findByState(PaymentState state);
}
