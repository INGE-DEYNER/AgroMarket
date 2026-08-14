package com.agromarket.application.dto.request.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que representa una solicitud de login con autenticación de dos factores.
 * Contiene el token temporal y el código OTP generado por la aplicación de autenticación.
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorLoginRequest {
    
    @NotBlank(message = "El token temporal es obligatorio")
    private String tempToken;
    
    @NotBlank(message = "El código OTP es obligatorio")
    @Pattern(regexp = "^[0-9]{6}$", message = "El código OTP debe tener 6 dígitos")
    private String code;
}
