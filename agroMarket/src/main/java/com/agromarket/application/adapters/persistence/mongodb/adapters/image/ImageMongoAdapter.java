package com.agromarket.application.adapters.persistence.mongodb.adapters.image;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.agromarket.application.adapters.persistence.mongodb.documents.image.ImageDocument;
import com.agromarket.application.adapters.persistence.mongodb.repositories.image.ImageMongoRepository;
import com.agromarket.domain.models.enums.image.ImageType;
import com.agromarket.domain.models.image.Image;
import com.agromarket.domain.ports.out.image.ImagePort;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ImageMongoAdapter implements ImagePort {

    private final ImageMongoRepository repository;

    @Override
    public Image save(Image image) {
        return repository.save(ImageDocument.fromDomain(image))
                .toDomain();
    }

    @Override
    public Optional<Image> findById(Long id) {
        return repository.findById(id.toString())
                .map(ImageDocument::toDomain);
    }

    @Override
    public List<Image> findByOwnerId(Long ownerId) {
        return repository.findByOwnerId(ownerId)
                .stream()
                .map(ImageDocument::toDomain)
                .toList();
    }

    @Override
    public List<Image> findByOwnerIdAndType(
            Long ownerId,
            ImageType type) {
        return repository.findByOwnerIdAndType(ownerId, type)
                .stream()
                .map(ImageDocument::toDomain)
                .toList();
    }

    @Override
    public void delete(Image image) {
        if (image != null && image.getId() != null) {
            repository.deleteById(image.getId().toString());
        }
    }
}
