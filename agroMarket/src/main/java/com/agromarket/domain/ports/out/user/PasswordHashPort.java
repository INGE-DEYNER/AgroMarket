package com.agromarket.domain.ports.out.user;


/**
 * Puerto de salida para operaciones de hashing de contraseñas.
 *
 * <p>La implementación concreta puede utilizar BCrypt, Argon2 u otro
 * algoritmo apropiado sin que el dominio conozca la tecnología.</p>
 */
public interface PasswordHashPort {

    /**
     * Genera un hash a partir de una contraseña en texto plano.
     */
    String hash(String raw);

    /**
     * Comprueba una contraseña en texto plano contra un hash.
     */
    boolean matches(String raw, String hashed);
}