package com.agromarket.interfaces.rest.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

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
public class LoginRequest {
    @NotBlank
    @Email
    @Size(max = 255)
    @JsonProperty("correo")
    @JsonAlias({"email", "mail", "username"})
    private String correo;

    @NotBlank
    @Size(min = 6, max = 100)
    @JsonProperty("contrasena")
    @JsonAlias({"password", "pass", "contraseña"})
    private String contrasena;
}
