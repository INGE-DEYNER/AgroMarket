package com.agromarket.domain.user.ports.in;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import com.agromarket.application.dto.request.user.UpdateProfileRequest;
import com.agromarket.application.dto.response.user.UserResponse;

/**
 * Puerto de entrada que define las operaciones de servicio para la gestión de usuarios.
 * Este puerto es implementado por los casos de uso de la capa de aplicación.
 * 
 * <p>Incluye operaciones como obtener información de usuarios, actualizar perfiles,
 * cambiar contraseñas, habilitar/deshabilitar usuarios, etc.</p>
 * 
 * @author AgroMarket Team
 */
public interface UserService {
    
    /**
     * Obtiene un usuario por su ID.
     * 
     * @param id ID del usuario
     * @return respuesta con los datos del usuario
     */
    @Transactional(readOnly = true)
    UserResponse getById(Long id);
    
    /**
     * Obtiene el perfil de un usuario por su ID.
     * 
     * @param id ID del usuario
     * @return respuesta con los datos del perfil del usuario
     */
    @Transactional(readOnly = true)
    UserResponse getProfile(Long id);
    
    /**
     * Obtiene todos los usuarios del sistema.
     * 
     * @return lista de respuestas con datos de todos los usuarios
     */
    @Transactional(readOnly = true)
    List<UserResponse> getAll();
    
    /**
     * Actualiza los datos de un usuario.
     * 
     * @param id ID del usuario a actualizar
     * @param request datos de actualización del usuario
     * @return respuesta con los datos del usuario actualizado
     */
    @Transactional
    UserResponse update(Long id, UpdateProfileRequest request);
    
    /**
     * Actualiza el perfil de un usuario.
     * 
     * @param id ID del usuario
     * @param request datos de actualización del perfil
     * @return respuesta con los datos del perfil actualizado
     */
    @Transactional
    UserResponse updateProfile(Long id, UpdateProfileRequest request);
    
    /**
     * Cambia la contraseña de un usuario.
     * 
     * @param id ID del usuario
     * @param newPassword nueva contraseña (ya hasheada)
     */
    @Transactional
    void changePassword(Long id, String newPassword);
    
    /**
     * Habilita un usuario.
     * 
     * @param id ID del usuario a habilitar
     */
    @Transactional
    void enable(Long id);
    
    /**
     * Deshabilita un usuario.
     * 
     * @param id ID del usuario a deshabilitar
     */
    @Transactional
    void disable(Long id);
}
