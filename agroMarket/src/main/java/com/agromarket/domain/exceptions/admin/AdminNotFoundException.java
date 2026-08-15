package com.agromarket.domain.exceptions.admin;

import com.agromarket.domain.exceptions.DomainException;

/**
 * Excepción lanzada cuando no se encuentra un administrador.
 */
public class AdminNotFoundException extends DomainException {

    public AdminNotFoundException(String message) {
        super(message);
    }
}