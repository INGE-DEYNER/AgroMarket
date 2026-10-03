package com.agromarket.domain.services.image;


import com.agromarket.domain.models.image.Image;

/**
 * Servicio de dominio para validar imágenes.
 */
public class ImageService {

    private static final long MAX_FILE_SIZE =
            10L * 1024L * 1024L;

    /**
     * Valida los datos principales de una imagen.
     */
    public void validate(Image image) {

        if (image == null) {
            throw new IllegalArgumentException(
                    "La imagen es obligatoria"
            );
        }

        if (image.getFileName() == null
                || image.getFileName().isBlank()) {

            throw new IllegalArgumentException(
                    "El nombre de archivo es obligatorio"
            );
        }

        if (image.getContentType() == null
                || image.getContentType().isBlank()) {

            throw new IllegalArgumentException(
                    "El tipo de contenido es obligatorio"
            );
        }

        if (!isSupportedContentType(
                image.getContentType())) {

            throw new IllegalArgumentException(
                    "El tipo de imagen no está permitido"
            );
        }

        if (image.getSize() == null
                || image.getSize() <= 0) {

            throw new IllegalArgumentException(
                    "El tamaño de la imagen debe ser mayor que cero"
            );
        }

        if (image.getSize() > MAX_FILE_SIZE) {

            throw new IllegalArgumentException(
                    "La imagen no puede superar los 10 MB"
            );

        }
    }

    /**
     * Determina si un tipo MIME de imagen es compatible.
     */
    public boolean isSupportedContentType(
            String contentType) {

        return "image/jpeg".equalsIgnoreCase(contentType)
                || "image/png".equalsIgnoreCase(contentType)
                || "image/webp".equalsIgnoreCase(contentType);
    }
}