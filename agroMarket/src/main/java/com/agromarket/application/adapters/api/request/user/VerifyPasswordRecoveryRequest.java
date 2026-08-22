package com.agromarket.application.adapters.api.request.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class VerifyPasswordRecoveryRequest {

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El correo electrónico no es válido")
    private String email;

    @NotBlank(message = "El código de recuperación es obligatorio")
    private String token;

    public VerifyPasswordRecoveryRequest() {
    }

    public VerifyPasswordRecoveryRequest(
            String email,
            String token) {

        this.email = email;
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}