package com.agromarket.domain.models;

import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.RolUsuario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class Usuario {
    private Long id;
    private String nombre;
    private String correo;
    private String contrasena;
    private String telefono;
    private RolUsuario rol;
    @Builder.Default
    private boolean activo = true;
    private LocalDateTime fechaRegistro;

    public boolean estaActivo() {
        return activo;
    }
}
