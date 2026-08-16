package com.agromarket.application.adapters.persistence.mongodb.repositories.order;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.agromarket.application.adapters.persistence.mongodb.documents.order.OrderDocument;
import com.agromarket.domain.models.enums.order.OrderState;

public interface OrderMongoRepository extends MongoRepository<OrderDocument, String> {
    List<OrderDocument> findByBuyerId(Long buyerId);

    List<OrderDocument> findByProducerId(Long producerId);

    List<OrderDocument> findByState(OrderState state);
}
