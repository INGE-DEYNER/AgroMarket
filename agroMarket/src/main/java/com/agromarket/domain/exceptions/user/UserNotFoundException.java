
package com.agromarket.domain.exceptions.user;
import com.agromarket.domain.exceptions.DomainException;
/**
 * Excepción lanzada cuando no se encuentra un usuario.
 */
public class UserNotFoundException extends DomainException {

    public UserNotFoundException(String message) {
        super(message);
    }
}
