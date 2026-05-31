package com.agromarket.application.dto;

import com.agromarket.domain.model.RolUsuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    @NotBlank
    @Size(min = 2, max = 100)
    @Pattern(regexp = "^[A-Za-z\\u00C0-\\u024F\\s]+$", message = "Solo se permiten letras y espacios")
    private String nombre;

    @Size(max = 100)
    @Pattern(regexp = "^$|^[A-Za-z\\u00C0-\\u024F\\s]+$", message = "Solo se permiten letras y espacios")
    private String apellido;

    @NotBlank
    @Email
    @Size(max = 255)
    private String correo;

    @NotBlank
    @Pattern(regexp = "^[0-9]{10}$", message = "Debe contener 10 dígitos numéricos")
    private String telefono;

    @NotBlank
    @Size(min = 8, max = 100)
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=[\\]{};':\",.<>/?]).{8,100}$",
            message = "Debe tener al menos 1 mayúscula, 1 número y 1 carácter especial")
    private String contrasena;

    @NotNull
    private RolUsuario rol;

    @Size(max = 255)
    private String ubicacion;
}
