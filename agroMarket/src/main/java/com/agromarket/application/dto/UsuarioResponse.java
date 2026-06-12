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
public class UsuarioResponse {
    private Long id;
    private String nombre;
    private String correo;
    private String telefono;
    private RolUsuario rol;
    private boolean activo;
    private boolean aprobado;
    private boolean twoFactorEnabled;
    private String ubicacion;
    private boolean emailVerificado;
    private String proveedor;
    private String idEncriptado;
}
