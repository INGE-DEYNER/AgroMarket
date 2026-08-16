package com.agromarket.domain.ports.in.image;

import com.agromarket.domain.models.enums.image.ImageType;

public record ImageUploadCommand(
        byte[] content,
        String fileName,
        String contentType,
        Long ownerId,
        ImageType type) {
}
