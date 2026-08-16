package com.agromarket.application.adapters.persistence.mongodb.repositories.product;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.agromarket.application.adapters.persistence.mongodb.documents.product.ProductDocument;
import com.agromarket.domain.models.enums.product.FruitType;

public interface ProductMongoRepository extends MongoRepository<ProductDocument, String> {
    List<ProductDocument> findByActiveTrue();

    List<ProductDocument> findByFruitType(FruitType fruitType);

    List<ProductDocument> findByProducerId(Long producerId);

    List<ProductDocument> findByOnPromotionTrue();

    @Query("{'$or':[{'name':{'$regex':?0,'$options':'i'}},{'description':{'$regex':?0,'$options':'i'}}]}")
    List<ProductDocument> searchByNameOrDescription(String query);
}