package com.agromarket.application.dto.request.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que representa una solicitud de recuperación de contraseña.
 * Contiene el correo electrónico del usuario que solicita restablecer su contraseña.
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetRequest {
    
    @Email(message = "El correo debe ser un email válido")
    @NotBlank(message = "El correo es obligatorio")
    private String email;
}
