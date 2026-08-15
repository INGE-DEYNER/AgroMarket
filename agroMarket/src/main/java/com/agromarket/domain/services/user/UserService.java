package com.agromarket.domain.services.user;



import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.models.user.User;

/**
 * Contiene reglas de negocio relacionadas con usuarios.
 */
public class UserService {

    /**
     * Verifica si el usuario puede iniciar sesión.
     *
     * @param user usuario
     * @return true si puede iniciar sesión
     */
    public boolean canLogin(User user) {
        return user != null
                && user.isActive()
                && user.isEmailVerified()
                && user.getRole() != null;
    }

    /**
     * Verifica si el usuario tiene un rol determinado.
     *
     * @param user usuario
     * @param role rol esperado
     * @return true si coincide
     */
    public boolean hasRole(User user, Role role) {
        return user != null
                && role != null
                && user.getRole() == role;
    }

    /**
     * Verifica si el usuario puede publicar productos.
     *
     * @param user usuario
     * @return true si es productor activo y aprobado
     */
    public boolean canPublishProducts(User user) {
        return user != null
                && user.isActive()
                && user.isAccountApproved()
                && user.isProducer();
    }

    /**
     * Verifica si el usuario puede realizar compras.
     *
     * @param user usuario
     * @return true si es comprador activo
     */
    public boolean canCreateOrders(User user) {
        return user != null
                && user.isActive()
                && user.isAccountApproved()
                && user.isBuyer();
    }
}