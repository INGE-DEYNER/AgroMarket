package com.agromarket.domain.services.user;

import com.agromarket.domain.models.user.User;

/**
 * Servicio de dominio para las reglas de activación de autenticación de dos factores.
 *
 * <p>La generación y validación criptográfica del código se resolverá
 * posteriormente desde infraestructura.</p>
 */
public class TwoFactorService {

    /**
     * Verifica si el usuario puede activar 2FA.
     *
     * @param user usuario
     * @return true si cumple las condiciones
     */
    public boolean canEnable(User user) {
        return user != null
                && user.isActive()
                && user.isEmailVerified();
    }

    /**
     * Verifica si el usuario tiene 2FA configurado.
     *
     * @param user usuario
     * @return true si está habilitado
     */
    public boolean isEnabled(User user) {
        return user != null
                && user.isTotpEnabled()
                && user.getTotpSecret() != null
                && !user.getTotpSecret().isBlank();
    }
}