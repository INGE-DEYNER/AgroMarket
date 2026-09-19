package com.agromarket.domain.ports.in.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Comando de dominio para iniciar sesión.
 *
 * <p>No representa un DTO de API. La capa application debe mapear
 * su LoginRequest a este comando.</p>
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginCommand {

    private String email;

    private String password;
}