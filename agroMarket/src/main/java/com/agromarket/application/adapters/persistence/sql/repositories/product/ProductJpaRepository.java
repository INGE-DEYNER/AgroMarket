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

    /**
     * Productos VIVOS de un productor. Filtra por `active` a proposito: el
     * borrado desde el panel de Admin es un soft delete (pone active=false), y
     * sin este filtro el inventario del productor seguia mostrando los
     * productos ya borrados desde el admin, con su stock intacto. El catalogo
     * publico y el panel de admin si lo filtraban, por eso el borrado parecia
     * no hacer efecto y el productor lo veía como un producto duplicado.
     */
    List<ProductEntity> findByProducer_IdAndActiveTrue(Long producerId);

    List<ProductEntity> findByProducer_Id(Long producerId);

    List<ProductEntity> findByOnPromotionTrue();

    Optional<ProductEntity> findByNameAndProducer_Id(
            String name,
            Long producerId);

    List<ProductEntity> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String name,
            String description);
}
