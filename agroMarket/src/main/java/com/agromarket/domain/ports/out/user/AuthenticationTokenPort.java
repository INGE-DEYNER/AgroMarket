package com.agromarket.domain.ports.out.user;

import java.util.Optional;

import com.agromarket.domain.models.user.User;

/**
 * Puerto de salida para generación y validación de tokens de autenticación.
 *
 * <p>
 * La implementación puede utilizar JWT u otra estrategia sin que
 * el dominio conozca el mecanismo concreto.
 * </p>
 */
public interface AuthenticationTokenPort {

    /**
     * Genera el token de autenticación definitivo de un usuario.
     */
    String generate(User user);

    /**
     * Genera un token temporal utilizado durante un flujo de 2FA.
     */
    String generateTemporary(User user);

    /**
     * Valida un token y devuelve el ID del usuario asociado.
     *
     * @param token token recibido
     * @return ID del usuario si el token es válido
     */
    Optional<Long> validate(String token);

    Optional<String> extractRole(String token);
}