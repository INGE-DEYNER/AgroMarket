
package com.agromarket.domain.exceptions.image;

/**
 * Excepción lanzada cuando una imagen no existe.
 */
public class ImageNotFoundException extends RuntimeException {

    public ImageNotFoundException(String message) {
        super(message);
    }
}