package com.agromarket.application.dto;

import com.agromarket.domain.model.RolUsuario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String tipo;
    private Long userId;
    private String nombre;
    private String correo;
    private RolUsuario rol;
    private boolean twoFactorRequired;
    private String tempToken;
}
