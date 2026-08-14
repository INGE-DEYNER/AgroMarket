package com.agromarket.infrastructure.persistence.sql.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.infrastructure.persistence.sql.entities.RequestForQuoteEntity;

public interface RequestForQuoteJpaRepository extends JpaRepository<RequestForQuoteEntity, Long> {
    List<RequestForQuoteEntity> findByBuyerId(Long buyerId);
    List<RequestForQuoteEntity> findByActiveTrue();
}
