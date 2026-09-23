package com.agromarket.application.adapters.persistence.sql.repositories.payment;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.adapters.persistence.sql.entities.payment.InvoiceEntity;

public interface InvoiceJpaRepository
        extends JpaRepository<InvoiceEntity, Long> {

    Optional<InvoiceEntity> findByOrder_Id(Long orderId);

    List<InvoiceEntity> findByUserId(Long userId);
}