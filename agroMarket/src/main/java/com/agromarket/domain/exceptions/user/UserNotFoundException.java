
package com.agromarket.domain.exceptions.user;

/**
 * Excepción lanzada cuando no se encuentra un usuario.
 */
public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(String message) {
        super(message);
    }
}
