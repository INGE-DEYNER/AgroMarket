package com.agromarket.application.adapters.persistence.sql.repositories.payment;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.agromarket.application.adapters.persistence.sql.entities.payment.CreditCardEntity;

public interface CreditCardJpaRepository extends JpaRepository<CreditCardEntity, Long> {
    List<CreditCardEntity> findByUser_IdAndActiveTrue(Long userId);
    Optional<CreditCardEntity> findByUser_IdAndGatewayToken(Long userId, String gatewayToken);
    Optional<CreditCardEntity> findByIdAndUser_Id(Long id, Long userId);
}
