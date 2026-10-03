package com.agromarket.application.adapters.api.request.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ResendVerificationRequest(

        @NotBlank(message = "El correo electrónico es obligatorio") @Email(message = "El correo electrónico no es válido") String email

) {
}