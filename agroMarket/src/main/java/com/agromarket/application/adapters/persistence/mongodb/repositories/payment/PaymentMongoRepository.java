package com.agromarket.application.adapters.persistence.mongodb.repositories.payment;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.agromarket.application.adapters.persistence.mongodb.documents.payment.PaymentDocument;

public interface PaymentMongoRepository
        extends MongoRepository<PaymentDocument, String> {

    List<PaymentDocument> findByOrderId(Long orderId);
}
