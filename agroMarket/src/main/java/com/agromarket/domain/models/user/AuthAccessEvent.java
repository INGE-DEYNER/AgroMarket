package com.agromarket.domain.models.user;


import java.time.Instant;

import com.agromarket.domain.models.enums.user.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Modelo de dominio que representa un evento de autenticación.
 *
 * <p>Este modelo no depende de ninguna tecnología de persistencia.
 * MongoDB, JPA u otra tecnología deberá realizar el mapeo correspondiente
 * desde y hacia este objeto.</p>
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthAccessEvent {

    private Long userId;

    private String email;

    private Role role;

    private String action;

    private boolean success;

    private String sessionId;

    private String ipAddress;

    private String userAgent;

    private String details;

    private Instant expiresAt;
}