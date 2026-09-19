package com.agromarket.application.adapters.persistence.sql.repositories.product;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.adapters.persistence.sql.entities.product.ProductEntity;
import com.agromarket.domain.models.enums.product.FruitType;

public interface ProductJpaRepository
        extends JpaRepository<ProductEntity, Long> {

    List<ProductEntity> findByActiveTrue();

    List<ProductEntity> findByFruitType(FruitType fruitType);

    List<ProductEntity> findByProducer_Id(Long producerId);

    List<ProductEntity> findByOnPromotionTrue();

    Optional<ProductEntity> findByNameAndProducer_Id(
            String name,
            Long producerId);

    List<ProductEntity> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String name,
            String description);
}
