
package com.agromarket.domain.exceptions.user;
import com.agromarket.domain.exceptions.DomainException;
/**
 * Excepción lanzada cuando la contraseña actual proporcionada por el usuario
 * no coincide con la almacenada (usada en el cambio de contraseña propio).
 */
public class InvalidCredentialsException extends DomainException {

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
