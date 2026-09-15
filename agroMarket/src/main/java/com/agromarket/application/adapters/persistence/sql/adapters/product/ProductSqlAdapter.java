package com.agromarket.application.adapters.persistence.sql.adapters.product;

import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.application.adapters.persistence.sql.entities.product.ProductEntity;
import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.product.ProductJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.user.UserJpaRepository;
import com.agromarket.domain.models.enums.product.FruitType;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.ports.out.product.ProductPort;

import lombok.RequiredArgsConstructor;

/**
 * Adaptador de persistencia de productos en MySQL
 * (reemplaza a ProductMongoAdapter): el catálogo es un dato
 * estructural y transaccional del negocio.
 */
@Component
@Profile("sql")
@RequiredArgsConstructor
@Transactional
public class ProductSqlAdapter implements ProductPort {

    private final ProductJpaRepository repository;
    private final UserJpaRepository userRepository;

    @Override
    public Product save(Product product) {
        UserEntity producer = userRepository.getReferenceById(
                product.getProducer().getId());
        ProductEntity entity = ProductEntity.fromDomain(product, producer);
        if (product.getId() != null) {
            // Conservar la fila existente para no perder el optimismo de versión.
            repository.findById(product.getId()).ifPresent(existing -> {
                entity.setVersion(existing.getVersion());
            });
        }
        return repository.save(entity).toDomain();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Product> findById(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return repository.findById(id)
                .map(ProductEntity::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> findAll() {
        return repository.findAll()
                .stream()
                .map(ProductEntity::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> findAllByActiveTrue() {
        return repository.findByActiveTrue()
                .stream()
                .map(ProductEntity::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> findByFruitType(FruitType fruitType) {
        return repository.findByFruitType(fruitType)
                .stream()
                .map(ProductEntity::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> findByProducerId(Long producerId) {
        return repository.findByProducer_Id(producerId)
                .stream()
                .map(ProductEntity::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> searchByNameOrDescription(String query) {
        return repository
                .findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                        query, query)
                .stream()
                .map(ProductEntity::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> findByOnPromotionTrue() {
        return repository.findByOnPromotionTrue()
                .stream()
                .map(ProductEntity::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Product> findByNameAndProducerId(String name, Long producerId) {
        return repository.findByNameAndProducer_Id(name, producerId)
                .map(ProductEntity::toDomain);
    }

    @Override
    public void delete(Product product) {
        if (product != null && product.getId() != null) {
            repository.deleteById(product.getId());
        }
    }
}
