package com.agromarket.interfaces.rest.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistroRequest {
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    private String correo; // for backward compatibility

    @Email
    private String email;

    private String contrasena; // for backward compatibility

    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String password;

    private String confirmPassword;

    @NotBlank(message = "El teléfono es obligatorio")
    private String telefono;

    @NotBlank(message = "El código de país es obligatorio")
    private String codigoPais;

    private String ubicacion;

    @NotBlank(message = "El rol es obligatorio")
    private String rol; // COMPRADOR | COMPRADOR_EMPRESA | PRODUCTOR | ADMIN

    // Opcionales para empresa
    private String nombreEmpresa;
    private String nit;

    // Helper methods to bind email and password
    public String getCorreo() {
        return email != null ? email : correo;
    }

    public String getEmail() {
        return email != null ? email : correo;
    }

    public String getContrasena() {
        return password != null ? password : contrasena;
    }

    public String getPassword() {
        return password != null ? password : contrasena;
    }
}
