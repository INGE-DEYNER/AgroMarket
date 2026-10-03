package com.agromarket.domain.ports.in.image;

import java.util.List;

import com.agromarket.domain.models.enums.image.ImageType;

public interface ImagePort {

    ImageResult upload(ImageUploadCommand command);

    ImageResult getById(Long id);

    List<ImageResult> getByOwner(Long ownerId);

    List<ImageResult> getByOwnerAndType(
            Long ownerId,
            ImageType type);

    void deactivate(Long id);
}
