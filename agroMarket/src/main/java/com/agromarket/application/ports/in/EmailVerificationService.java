package com.agromarket.application.ports.in;

import com.agromarket.infrastructure.persistence.sql.entities.UsuarioEntity;

public interface EmailVerificationService {
    void sendVerificationEmail(UsuarioEntity usuario);
    void sendVerificationEmail(String correo);

    com.agromarket.infrastructure.persistence.sql.entities.UsuarioEntity verifyCode(String correo, String codigo);

    com.agromarket.infrastructure.persistence.sql.entities.UsuarioEntity verifyToken(String token);
}
