package com.agromarket.application.api.request;

import jakarta.validation.constraints.Email;
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
public class VerificarCorreoRequest {
    @NotBlank
    @Email
    @Size(max = 255)
    private String correo;

    @NotBlank
    @Pattern(regexp = "^[0-9]{6}$", message = "Debe contener 6 dígitos numéricos")
    private String codigo;
}