package com.agromarket.domain.services.admin;


import com.agromarket.domain.models.admin.Admin;
import com.agromarket.domain.models.enums.admin.AdminAction;
import com.agromarket.domain.models.user.User;

/**
 * Servicio de dominio para las reglas de administración.
 */
public class AdminService {

    /**
     * Verifica si un usuario puede considerarse administrador activo.
     */
    public boolean isAuthorizedAdmin(User user) {

        return user != null
                && user.isAdmin()
                && user.isActive()
                && user.isAccountApproved();
    }

    /**
     * Verifica si el administrador puede ejecutar una acción.
     *
     * @param admin administrador
     * @param action acción
     * @return true si puede ejecutarla
     */
    public boolean canPerform(
            Admin admin,
            AdminAction action) {

        return admin != null
                && admin.isActive()
                && action != null
                && admin.getUser() != null
                && admin.getUser().isAdmin()
                && admin.getUser().isActive();
    }
}