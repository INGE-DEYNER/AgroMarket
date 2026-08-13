package com.agromarket.interfaces.rest.request;

import com.agromarket.domain.models.enums.RolUsuario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactoResponse {
    private Long usuarioId;
    private String nombre;
    private RolUsuario rol;
    private String ultimoMensaje;
    private long noLeidos;
}
