package com.agromarket.domain.models.image;

import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.image.ImageType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Representa una imagen almacenada o asociada a una entidad del negocio.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Image {

    private Long id;

    private String url;

    private String publicId;

    private String fileName;

    private String contentType;

    private Long size;

    private ImageType type;

    private Long ownerId;

    private LocalDateTime createdAt;

    private boolean active;

    /**
     * Verifica si la imagen tiene información mínima válida.
     *
     * @return true cuando cumple las reglas básicas
     */
    public boolean isValid() {
        return url != null
                && !url.isBlank()
                && fileName != null
                && !fileName.isBlank()
                && size != null
                && size > 0
                && type != null;
    }
}