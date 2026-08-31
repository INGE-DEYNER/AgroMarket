package com.agromarket.domain.ports.in.user;

import java.util.List;

/**
 * Puerto de entrada que define las operaciones de servicio para la gestión de
 * usuarios.
 * Este puerto es implementado por los casos de uso de la capa de aplicación.
 *
 * 
 * <p>
 * Incluye operaciones como obtener información de usuarios, actualizar
 * perfiles,
 * cambiar contraseñas, habilitar/deshabilitar usuarios, etc.
 * </p>
 * 
 * @author AgroMarket Team
 */
public interface UserPort {

  /**
   * Obtiene un usuario por su ID.
   *
   * 
   * @param id ID del usuario
   * @return resultado con los datos del usuario
   */

  UserResult getById(Long id);

  /**
   * Obtiene el perfil de un usuario por su ID.
   *
   * 
   * @param id ID del usuario
   * @return resultado con los datos del perfil del usuario
   */

  UserResult getProfile(Long id);

  /**
   * Obtiene todos los usuarios del sistema.
   *
   * 
   * @return lista de resultados con datos de todos los usuarios
   */

  List<UserResult> getAll();

  /**
   * Actualiza los datos de un usuario.
   *
   * 
   * @param id      ID del usuario a actualizar
   * @param command datos de actualización
   * @return resultado con los datos actualizados
   */

  UserResult update(Long id, UpdateProfileCommand command);

  /**
   * Actualiza el perfil de un usuario.
   *
   * 
   * @param id      ID del usuario
   * 
   * @param command datos de actualización del perfil
   * @return resultado con los datos del perfil actualizado
   */

  UserResult updateProfile(Long id, UpdateProfileCommand command);

  /**
   * Cambia la contraseña de un usuario.
   *
   * 
   * @param id          ID del usuario
   * @param newPassword nueva contraseña (ya hasheada)
   */

  void changePassword(Long id, String newPassword);

  /**
   * Cambia la contraseña del propio usuario autenticado, verificando primero
   * que la contraseña actual sea correcta.
   *
   * @param id              ID del usuario (extraído del token, nunca del body)
   * @param currentPassword contraseña actual en texto plano, para verificar
   * @param newPassword     nueva contraseña en texto plano
   * @throws com.agromarket.domain.exceptions.user.InvalidCredentialsException
   *                        si la contraseña actual no coincide
   */
  void changeOwnPassword(Long id, String currentPassword, String newPassword);

  /**
   * Habilita un usuario.
   *
   * 
   * @param id ID del usuario a habilitar
   */

  void enable(Long id);

  /**
   * Deshabilita un usuario.
   *
   * @param id ID del usuario a deshabilitar
   */

  void disable(Long id);

  /**
   * Productores (rol PRODUCER) cuya cuenta aún no ha sido aprobada
   * (accountApproved != true). Alimenta la sección "Productores por
   * validar" del panel de administración.
   *
   * @return lista de productores pendientes de aprobación
   */
  List<UserResult> getPendientesAprobacion();

  /**
   * Aprueba la cuenta de un usuario (accountApproved = true).
   * Usado por el panel de administración al aceptar un productor.
   *
   * @param id ID del usuario a aprobar
   * @return resultado con los datos actualizados del usuario
   */
  UserResult aprobarUsuario(Long id);

  /**
   * Rechaza la solicitud de aprobación de un usuario
   * (accountApproved = false, accountStatus = REJECTED).
   *
   * @param id ID del usuario a rechazar
   * @return resultado con los datos actualizados del usuario
   */
  UserResult rechazarUsuario(Long id);

  /**
   * Alterna el flag verifiedProducer de un productor
   * (verificado / no verificado).
   *
   * @param id ID del productor
   * @return resultado con los datos actualizados del usuario
   */
  UserResult toggleVerificadoProductor(Long id);
}