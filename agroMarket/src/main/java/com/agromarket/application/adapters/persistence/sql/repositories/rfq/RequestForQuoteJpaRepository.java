package com.agromarket.application.adapters.persistence.sql.repositories.rfq;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.adapters.persistence.sql.entities.rfq.RequestForQuoteEntity;
import com.agromarket.domain.models.enums.rfq.RequestForQuoteStatus;

public interface RequestForQuoteJpaRepository
                extends JpaRepository<RequestForQuoteEntity, Long> {

        List<RequestForQuoteEntity> findByStatus(
                        RequestForQuoteStatus status);

        List<RequestForQuoteEntity> findByBuyer_Id(
                        Long buyerId);

        Optional<RequestForQuoteEntity> findById(Long id);
}
