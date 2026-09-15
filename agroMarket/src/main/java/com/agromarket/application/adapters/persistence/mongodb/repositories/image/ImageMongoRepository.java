package com.agromarket.application.adapters.persistence.mongodb.repositories.image;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.agromarket.application.adapters.persistence.mongodb.documents.image.ImageDocument;
import com.agromarket.domain.models.enums.image.ImageType;

public interface ImageMongoRepository
                extends MongoRepository<ImageDocument, String> {

        List<ImageDocument> findByOwnerId(Long ownerId);

        List<ImageDocument> findByOwnerIdAndType(
                        Long ownerId,
                        ImageType type);
}
