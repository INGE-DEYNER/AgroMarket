package com.agromarket.domain.ports.out.admin;

import java.util.List;
import java.util.Optional;

import com.agromarket.domain.models.admin.Admin;

/**
 * Puerto de salida para la persistencia de administradores.
 */
public interface AdminPort  {

    /**
     * Guarda un administrador.
     */
    Admin save(Admin admin);

    /**
     * Busca un administrador por identificador.
     */
    Optional<Admin> findById(Long id);

    /**
     * Busca un administrador por el ID del usuario.
     */
    Optional<Admin> findByUserId(Long userId);

    /**
     * Obtiene administradores activos.
     */
    List<Admin> findActive();

    
}
