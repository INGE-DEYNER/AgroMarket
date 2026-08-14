package com.agromarket.application.dto.request.user;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que representa una solicitud de inicio de sesión.
 * Contiene las credenciales del usuario (correo y contraseña).
 * 
 * <p>Soporta múltiples nombres de campos para compatibilidad:</p>
 * <ul>
 *   <li>correo, email, mail, username para el campo de correo</li>
 *   <li>contrasena, password, pass, contraseña para el campo de contraseña</li>
 * </ul>
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo debe ser un email válido")
    @Size(max = 255)
    @JsonProperty("email")
    @JsonAlias({"correo", "mail", "username"})
    private String email;
    
    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, max = 100, message = "La contraseña debe tener entre 6 y 100 caracteres")
    @JsonProperty("password")
    @JsonAlias({"contrasena", "pass", "contraseña"})
    private String password;
}
