package com.agromarket.application.dto.request.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import lombok.Data;

/**
 * DTO que representa una solicitud para verificar un código de autenticación.
 * Se usa en flujos de verificación de email o teléfono.
 * 
 * @author AgroMarket Team
 */
@Data
public class VerifyCodeRequest {
    
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Formato de correo inválido")
    private String email;
    
    @NotBlank(message = "El código es obligatorio")
    private String code;
}
