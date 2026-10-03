package com.agromarket.domain.ports.out.user;

import java.time.Instant;
import java.util.List;

import com.agromarket.domain.models.user.AuthAccessEvent;

/**
 * Puerto de salida que define el contrato para el almacenamiento de eventos de
 * autenticación.
 * 
 * @author AgroMarket Team
 *         El dominio no conoce la tecnología concreta de persistencia.
 */
public interface AuthEventPort {

  /**
   * Registra un evento de autenticación.
   * 
   */

  void logAuthEvent(AuthAccessEvent event);

  /**
   * Obtiene todos los eventos de autenticación de un usuario.
   *
   * 
   * @param userId ID del usuario
   * @return lista de eventos asociados al usuario ordenados por fecha descendente
   * 
   *         List<AuthAccessEvent> getEventsByUserId(Long userId);
   * 
   *         /**
   *         Obtiene todos los eventos de autenticación de un correo electrónico.
   *
   * 
   * @param email correo electrónico del usuario
   * @return lista de eventos asociados al correo ordenados por fecha descendente
   */

  List<AuthAccessEvent> getEventsByEmail(String email);

  /**
   * Obtiene los intentos fallidos de login de un usuario.
   *
   * 
   * @param email correo electrónico del usuario
   * @param since fecha a partir de la cual buscar intentos
   * @return lista de intentos fallidos de login
   */

  List<AuthAccessEvent> getFailedLoginAttempts(String email, Instant since);

  /**
   * Elimina eventos de autenticación expirados.
   *
   * 
   * @param now fecha actual para comparar con la expiración
   */
  void deleteExpiredEvents(Instant now);

  List<AuthAccessEvent> getEventsByUserId(Long userId);
}