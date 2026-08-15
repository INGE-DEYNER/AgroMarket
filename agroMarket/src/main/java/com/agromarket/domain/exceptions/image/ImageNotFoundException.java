
package com.agromarket.domain.exceptions.image;
import com.agromarket.domain.exceptions.DomainException;
/**
 * Excepción lanzada cuando una imagen no existe.
 */
public class ImageNotFoundException extends DomainException {

    public ImageNotFoundException(String message) {
        super(message);
    }
}