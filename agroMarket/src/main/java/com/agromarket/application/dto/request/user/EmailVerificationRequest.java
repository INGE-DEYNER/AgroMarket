package com.agromarket.application.dto.request.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que representa una solicitud para verificar un token de verificación de correo.
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationRequest {
    
    @NotBlank(message = "El token es obligatorio")
    @Size(min = 6, max = 500, message = "El token debe ser válido")
    private String token;
}
