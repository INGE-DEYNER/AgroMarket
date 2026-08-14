package com.agromarket.domain.ports.in.admin;

import java.util.List;

import com.agromarket.domain.models.admin.Admin;
import com.agromarket.domain.models.enums.admin.AdminAction;

/**
 * Puerto de entrada para las operaciones administrativas.
 */
public interface AdminPort {

    /**
     * Obtiene la información administrativa de un usuario.
     */
    Admin getAdminByUserId(Long userId);

    /**
     * Verifica si un administrador puede ejecutar una acción.
     */
    boolean canPerform(Long userId, AdminAction action);

    /**
     * Obtiene los administradores activos.
     */
    List<Admin> getActiveAdmins();
}