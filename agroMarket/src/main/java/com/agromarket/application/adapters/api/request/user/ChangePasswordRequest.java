package com.agromarket.application.adapters.api.request.user;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Petición de cambio de contraseña del usuario autenticado
 * (PUT /usuarios/me/contrasena).
 *
 * <p>Los alias en español evitan un 400 confuso si el cliente manda
 * `contrasenaActual` / `nuevaContrasena` en vez de los nombres canónicos.</p>
 */
public record ChangePasswordRequest(
        @NotBlank @JsonAlias({ "contrasenaActual" }) String currentPassword,
        @NotBlank @Size(min=8, max=128) @JsonAlias({ "nuevaContrasena" }) String newPassword) {}
