
package com.agromarket.domain.exceptions.admin;

/**
 * Excepción lanzada cuando no se encuentra un administrador.
 */
public class AdminNotFoundException extends RuntimeException {

    public AdminNotFoundException(String message) {
        super(message);
    }
}