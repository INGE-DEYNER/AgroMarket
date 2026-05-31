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
public class ActualizarUsuarioRequest {
    @NotBlank
    @Size(min = 2, max = 100)
    @Pattern(regexp = "^[A-Za-z\\u00C0-\\u024F\\s]+$", message = "Solo se permiten letras y espacios")
    private String nombre;

    @NotBlank
    @Pattern(regexp = "^[0-9]{10}$", message = "Debe contener 10 dígitos numéricos")
    private String telefono;
}
