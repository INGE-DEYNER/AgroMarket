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
    private boolean pendienteAprobacion;
    // Incluido en login para evitar un segundo /me call en el frontend
    private boolean cuentaCompleta;
    private String fotoUrl;
    private String apellido;
}
