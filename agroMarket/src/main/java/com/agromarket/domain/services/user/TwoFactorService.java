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

    /**
     * Verifica si a este usuario hay que exigirle 2FA aunque no lo tenga
     * configurado.
     *
     * <p>Un administrador sin 2FA solo esta protegido por su contraseña. Si esa
     * se filtra por un formulario, un correo reenviado o una pega del
     * proyecto, quien entre tiene el panel entero. El 2FA es lo que evita que
     * una contraseña sola alcance una cuenta administrativa.
     *
     * <p>Se aplica solo a ADMIN: obligar a todos complica el uso diario sin
     * proteger nada que no proteja al comprador o al productor, que no manejan
     * datos de otros usuarios.
     *
     * @param user usuario
     * @return true si el rol obliga a tener 2FA
     */
    public boolean esObligatorio(User user) {
        return user != null
                && user.getRole() != null
                && "ADMIN".equalsIgnoreCase(user.getRole().name());
    }
}