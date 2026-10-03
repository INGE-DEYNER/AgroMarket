package com.agromarket.application.adapters.api.response.image;

import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.image.ImageType;
import com.agromarket.domain.ports.in.image.ImageResult;

public record ImageResponse(
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

    public static ImageResponse fromResult(
            ImageResult result) {

        if (result == null) {
            return null;
        }

        return new ImageResponse(
                result.id(),
                result.url(),
                result.publicId(),
                result.fileName(),
                result.contentType(),
                result.size(),
                result.type(),
                result.ownerId(),
                result.createdAt(),
                result.active());
    }
}
