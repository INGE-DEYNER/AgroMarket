package com.agromarket.application.adapters.persistence.mongodb.documents.image;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.agromarket.domain.models.enums.image.ImageType;
import com.agromarket.domain.models.image.Image;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "images")
public class ImageDocument {

    @Id
    private String id;

    private String url;

    private String publicId;

    private String fileName;

    private String contentType;

    private Long size;

    private ImageType type;

    @Indexed
    private Long ownerId;

    @Indexed
    private boolean active;

    private LocalDateTime createdAt;

    public Image toDomain() {
        return Image.builder()
                .id(parseId(id))
                .url(url)
                .publicId(publicId)
                .fileName(fileName)
                .contentType(contentType)
                .size(size)
                .type(type)
                .ownerId(ownerId)
                .createdAt(createdAt)
                .active(active)
                .build();
    }

    public static ImageDocument fromDomain(Image image) {
        return ImageDocument.builder()
                .id(image.getId() != null
                        ? image.getId().toString()
                        : null)
                .url(image.getUrl())
                .publicId(image.getPublicId())
                .fileName(image.getFileName())
                .contentType(image.getContentType())
                .size(image.getSize())
                .type(image.getType())
                .ownerId(image.getOwnerId())
                .createdAt(image.getCreatedAt())
                .active(image.isActive())
                .build();
    }

    private static Long parseId(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return Long.valueOf(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
