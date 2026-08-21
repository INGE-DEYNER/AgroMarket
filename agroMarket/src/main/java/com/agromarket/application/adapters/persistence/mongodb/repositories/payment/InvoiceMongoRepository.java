package com.agromarket.application.adapters.persistence.mongodb.repositories.payment;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.agromarket.application.adapters.persistence.mongodb.documents.payment.InvoiceDocument;

public interface InvoiceMongoRepository
        extends MongoRepository<InvoiceDocument, String> {

    Optional<InvoiceDocument> findByOrderId(Long orderId);

    List<InvoiceDocument> findByUserId(Long userId);
}