package com.agromarket.application.dto.request.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que representa una solicitud de registro de nuevo usuario.
 * Contiene todos los datos necesarios para crear una cuenta en el sistema.
 * 
 * <p>Validaciones:</p>
 * <ul>
 *   <li>Todos los campos obligatorios están marcados con @NotBlank</li>
 *   <li>El correo debe ser un email válido</li>
 *   <li>La contraseña debe tener al menos 8 caracteres</li>
 * </ul>
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    
    @NotBlank(message = "El nombre es obligatorio")
    private String firstName;
    
    @NotBlank(message = "El apellido es obligatorio")
    private String lastName;
    
    @Email(message = "El correo debe ser un email válido")
    @NotBlank(message = "El correo es obligatorio")
    private String email;
    
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @NotBlank(message = "La contraseña es obligatoria")
    private String password;
    
    @NotBlank(message = "La confirmación de contraseña es obligatoria")
    private String confirmPassword;
    
    @NotBlank(message = "El teléfono es obligatorio")
    private String phone;
    
    @NotBlank(message = "El código de país es obligatorio")
    private String countryCode;
    
    private String location;
    
    @NotBlank(message = "El rol es obligatorio")
    private String role; // BUYER | BUYER_COMPANY | PRODUCER | ADMIN
    
    // Opcionales para empresa
    private String companyName;
    private String nit;
}
