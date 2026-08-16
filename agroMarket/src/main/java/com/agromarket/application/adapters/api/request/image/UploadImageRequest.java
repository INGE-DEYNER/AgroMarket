package com.agromarket.application.adapters.api.request.image;

import com.agromarket.domain.models.enums.image.ImageType;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record UploadImageRequest(
                @NotNull @Positive Long ownerId,
                @NotNull ImageType type) {
}
