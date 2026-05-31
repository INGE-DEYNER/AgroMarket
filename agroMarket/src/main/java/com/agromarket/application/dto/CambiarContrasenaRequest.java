package com.agromarket.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CambiarContrasenaRequest {
    @NotBlank(message = "La contraseña actual es obligatoria")
    @Size(min = 8, max = 100, message = "La contraseña actual debe tener entre 8 y 100 caracteres")
    private String contrasenaActual;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = 8, max = 100, message = "La contraseña debe tener entre 8 y 100 caracteres")
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=[\\]{};':\",.<>/?]).{8,100}$",
            message = "Debe tener al menos 1 mayúscula, 1 número y 1 carácter especial")
    private String nuevaContrasena;
}

