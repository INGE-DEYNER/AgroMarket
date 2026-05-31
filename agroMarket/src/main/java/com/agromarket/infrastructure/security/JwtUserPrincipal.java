package com.agromarket.infrastructure.security;

import com.agromarket.domain.model.RolUsuario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtUserPrincipal {
    private Long userId;
    private String correo;
    private RolUsuario rol;

    public Long getUserId() {
        return this.userId;
    }
}
