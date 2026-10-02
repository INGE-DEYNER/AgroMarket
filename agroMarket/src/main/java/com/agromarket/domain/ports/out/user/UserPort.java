package com.agromarket.domain.ports.out.user;

import java.util.List;
import java.util.Optional;

import com.agromarket.domain.models.user.User;

/**
 * Puerto de salida que define el contrato para la persistencia de usuarios.
 * Este puerto abstrae la tecnología de persistencia (JPA, JDBC, etc.) y permite
 * al dominio interactuar con el almacenamiento de usuarios sin depender de
 * detalles de implementación.
 * 
 * <p>
 * Todas las operaciones de CRUD para usuarios deben definirse aquí.
 * Las implementaciones concretas (adaptadores) irán en la capa de
 * infraestructura.
 * </p>
 * 
 * @author AgroMarket Team
 */
public interface UserPort {

    /**
     * Guarda un usuario en el almacenamiento.
     * 
     * @param user usuario a guardar
     * @return usuario guardado con su ID generado
     */
    User save(User user);

    /**
     * Busca un usuario por su ID.
     * 
     * @param id ID del usuario
     * @return Optional con el usuario si existe, vacío de lo contrario
     */
    Optional<User> findById(Long id);

    /**
     * Busca un usuario por su correo electrónico.
     * 
     * @param email correo electrónico del usuario
     * @return Optional con el usuario si existe, vacío de lo contrario
     */
    Optional<User> findByEmail(String email);

    /**
     * Busca todos los usuarios del sistema.
     * 
     * @return lista de todos los usuarios
     */
    List<User> findAll();

    /**
     * Busca usuarios por su rol.
     * 
     * @param role rol de los usuarios a buscar
     * @return lista de usuarios con el rol especificado
     */
    List<User> findByRole(String role);

    /**
     * Elimina un usuario por su ID.
     * 
     * @param id ID del usuario a eliminar
     */
    void deleteById(Long id);

    /**
     * Verifica si existe un usuario con el correo electrónico dado.
     * 
     * @param email correo electrónico a verificar
     * @return true si existe, false de lo contrario
     */
    boolean existsByEmail(String email);

    /**
     * Busca un usuario por su token de verificación de correo.
     * 
     * @param token token de verificación de correo
     * @return Optional con el usuario si existe, vacío de lo contrario
     */
    Optional<User> findByEmailVerificationToken(String token);

    /**
     * Busca un usuario por su token de recuperación de contraseña.
     * 
     * @param token token de recuperación de contraseña
     * @return Optional con el usuario si existe, vacío de lo contrario
     */
    Optional<User> findByPasswordResetToken(String token);

    void changePassword(Long userId, String newPassword);

}
