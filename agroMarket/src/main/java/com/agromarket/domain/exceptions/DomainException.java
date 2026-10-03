
package com.agromarket.domain.exceptions;

/**
 * Excepción base para los errores relacionados con las reglas del dominio
 * de AgroMarket.
 *
 * @author AgroMarket Team
 */
public class DomainException extends RuntimeException {

    /**
     * Crea una excepción de dominio con un mensaje descriptivo.
     *
     * @param message mensaje que describe el error
     */
    public DomainException(String message) {
        super(message);
    }

    /**
     * Crea una excepción de dominio con un mensaje y una causa.
     *
     * @param message mensaje que describe el error
     * @param cause causa original del error
     */
    public DomainException(String message, Throwable cause) {
        super(message, cause);
    }
}