package com.agromarket.domain.ports.in.image;

import java.util.List;

import com.agromarket.domain.models.enums.image.ImageType;
import com.agromarket.domain.models.image.Image;

/**
 * Puerto de entrada para la gestión de imágenes.
 */
public interface ImagePort {

    /**
     * Registra una imagen en el dominio.
     */
    Image save(Image image);

    /**
     * Obtiene una imagen por ID.
     */
    Image getById(Long id);

    /**
     * Obtiene las imágenes asociadas a un propietario.
     */
    List<Image> getByOwner(Long ownerId);

    /**
     * Obtiene las imágenes de un propietario filtradas por tipo.
     */
    List<Image> getByOwnerAndType(Long ownerId, ImageType type);

    /**
     * Desactiva una imagen.
     */
    void deactivate(Long id);
}