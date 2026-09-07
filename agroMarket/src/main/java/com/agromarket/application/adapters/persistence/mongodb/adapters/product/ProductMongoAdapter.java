
package com.agromarket.application.adapters.persistence.mongodb.adapters.product;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import com.agromarket.application.adapters.persistence.mongodb.repositories.product.ProductMongoRepository;
import com.agromarket.application.adapters.persistence.mongodb.documents.product.ProductDocument;
import com.agromarket.domain.models.enums.product.FruitType;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.ports.out.product.ProductPort;

@Component
@RequiredArgsConstructor
public class ProductMongoAdapter implements ProductPort {
    private final ProductMongoRepository repository;

    public Product save(Product p) {
        if (p.getId() == null) {
            p.setId(System.currentTimeMillis());
        }
        String searchId = String.valueOf(p.getId());
        Optional<ProductDocument> existingOpt = repository.findById(searchId);
        if (existingOpt.isEmpty()) {
            existingOpt = repository.findAll().stream()
                    .filter(doc -> doc.getId() != null && (long) doc.getId().hashCode() == p.getId())
                    .findFirst();
        }
        ProductDocument doc = ProductDocument.fromDomain(p);
        if (existingOpt.isPresent()) {
            doc.setId(existingOpt.get().getId());
        }
        return repository.save(doc).toDomain();
    }

    public Optional<Product> findById(Long id) {
        if (id == null)
            return Optional.empty();
        Optional<ProductDocument> found = repository.findById(String.valueOf(id));
        if (found.isPresent()) {
            return found.map(ProductDocument::toDomain);
        }
        return repository.findAll().stream()
                .filter(doc -> {
                    if (doc.getId() == null)
                        return false;
                    try {
                        return Long.parseLong(doc.getId()) == id;
                    } catch (NumberFormatException e) {
                        return (long) doc.getId().hashCode() == id;
                    }
                })
                .findFirst()
                .map(ProductDocument::toDomain);
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
        if (p == null || p.getId() == null)
            return;
        String searchId = String.valueOf(p.getId());
        if (repository.existsById(searchId)) {
            repository.deleteById(searchId);
        } else {
            repository.findAll().stream()
                    .filter(doc -> doc.getId() != null && (long) doc.getId().hashCode() == p.getId())
                    .findFirst()
                    .ifPresent(doc -> repository.deleteById(doc.getId()));
        }
    }

    @Override
    public Optional<Product> findByNameAndProducerId(String name, Long producerId) {
        return repository.findByNameAndProducerId(name, producerId)
                .map(ProductDocument::toDomain);
    }
}