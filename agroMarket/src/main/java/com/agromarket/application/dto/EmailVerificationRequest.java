package com.agromarket.application.dto;

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
public class EmailVerificationRequest {
    @NotBlank(message = "El token es obligatorio")
    @Size(min = 6, max = 500, message = "El token debe ser válido")
    private String token;
}

