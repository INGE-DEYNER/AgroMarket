package com.agromarket.domain.ports.in.user;

 import java.util.List;
 
 import org.springframework.transaction.annotation.Transactional;
 
/**
  * Puerto de entrada que define las operaciones de servicio para la gestión de usuarios.
  * Este puerto es implementado por los casos de uso de la capa de aplicación.

 *
  * <p>Incluye operaciones como obtener información de usuarios, actualizar perfiles,
  * cambiar contraseñas, habilitar/deshabilitar usuarios, etc.</p>
* 
  * @author AgroMarket Team
  */
 public interface UserPort {


     /**
      * Obtiene un usuario por su ID.

     *
      * @param id ID del usuario
     * @return resultado con los datos del usuario
      */
     @Transactional(readOnly = true)

    UserResult getById(Long id);

     /**
      * Obtiene el perfil de un usuario por su ID.

     *
      * @param id ID del usuario
     * @return resultado con los datos del perfil del usuario
      */
     @Transactional(readOnly = true)

    UserResult getProfile(Long id);

     /**
      * Obtiene todos los usuarios del sistema.

     *
     * @return lista de resultados con datos de todos los usuarios
      */
     @Transactional(readOnly = true)

    List<UserResult> getAll();

     /**
      * Actualiza los datos de un usuario.

     *
      * @param id ID del usuario a actualizar
     * @param command datos de actualización
     * @return resultado con los datos actualizados
      */
     @Transactional
    UserResult update(Long id, UpdateProfileCommand command);

     /**
      * Actualiza el perfil de un usuario.

     *
      * @param id ID del usuario

     * @param command datos de actualización del perfil
     * @return resultado con los datos del perfil actualizado
      */
     @Transactional

    UserResult updateProfile(Long id, UpdateProfileCommand command);

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