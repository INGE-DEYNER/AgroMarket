
package com.agromarket.domain.ports.out.image;

import java.util.List;
import java.util.Optional;

import com.agromarket.domain.models.enums.image.ImageType;
import com.agromarket.domain.models.image.Image;

/**
 * Puerto de salida para persistencia de imágenes.
 */
public interface ImagePort {

    /**
     * Guarda una imagen.
     */
    Image save(Image image);

    /**
     * Busca una imagen por ID.
     */
    Optional<Image> findById(Long id);

    /**
     * Obtiene imágenes por propietario.
     */
    List<Image> findByOwnerId(Long ownerId);

    /**
     * Obtiene imágenes por propietario y tipo.
     */
    List<Image> findByOwnerIdAndType(
            Long ownerId,
            ImageType type
    );

    /**
     * Elimina una imagen.
     */
    void delete(Image image);
}