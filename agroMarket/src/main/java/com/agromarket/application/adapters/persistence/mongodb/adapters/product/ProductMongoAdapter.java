package com.agromarket.application.adapters.persistence.mongodb.adapters.product;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import com.agromarket.application.adapters.persistence.mongodb.repositories.product.ProductMongoRepository;
import com.agromarket.application.adapters.persistence.mongodb.documents.product.ProductDocument;
import com.agromarket.domain.models.enums.product.FruitType;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.ports.out.product.ProductPort;

@Component
@Profile("mongo")
@RequiredArgsConstructor
public class ProductMongoAdapter implements ProductPort {
    private final ProductMongoRepository repository;

    public Product save(Product p) {
        return repository.save(ProductDocument.fromDomain(p)).toDomain();
    }

    public Optional<Product> findById(Long id) {
        return repository.findById(String.valueOf(id)).map(entity -> entity.toDomain());
    }

    public List<Product> findAll() {
        return repository.findAll().stream().map(entity -> entity.toDomain()).collect(Collectors.toList());
    }

    public List<Product> findAllByActiveTrue() {
        return repository.findByActiveTrue().stream().map(entity -> entity.toDomain()).collect(Collectors.toList());
    }

    public List<Product> findByFruitType(FruitType f) {
        return repository.findByFruitType(f).stream().map(entity -> entity.toDomain()).collect(Collectors.toList());
    }

    public List<Product> findByProducerId(Long id) {
        return repository.findByProducerId(id).stream().map(entity -> entity.toDomain()).collect(Collectors.toList());
    }

    public List<Product> searchByNameOrDescription(String q) {
        return repository.searchByNameOrDescription(q).stream().map(entity -> entity.toDomain())
                .collect(Collectors.toList());
    }

    public List<Product> findByOnPromotionTrue() {
        return repository.findByOnPromotionTrue().stream().map(entity -> entity.toDomain())
                .collect(Collectors.toList());
    }

    public void delete(Product p) {
        repository.deleteById(String.valueOf(p.getId()));
    }
}