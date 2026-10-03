package com.agromarket.domain.ports.in.image;

import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.image.ImageType;
import com.agromarket.domain.models.image.Image;

public record ImageResult(
        Long id,
        String url,
        String publicId,
        String fileName,
        String contentType,
        Long size,
        ImageType type,
        Long ownerId,
        LocalDateTime createdAt,
        boolean active) {

    public static ImageResult fromDomain(Image image) {
        if (image == null) {
            return null;
        }

        return new ImageResult(
                image.getId(),
                image.getUrl(),
                image.getPublicId(),
                image.getFileName(),
                image.getContentType(),
                image.getSize(),
                image.getType(),
                image.getOwnerId(),
                image.getCreatedAt(),
                image.isActive());
    }
}
