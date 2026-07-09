package com.agromarket.domain.ports;

import com.agromarket.application.persistence.sql.entities.UsuarioEntity;

public interface EmailVerificationService {
    void sendVerificationEmail(UsuarioEntity usuario);
    void sendVerificationEmail(String correo);

    com.agromarket.application.persistence.sql.entities.UsuarioEntity verifyCode(String correo, String codigo);

    com.agromarket.application.persistence.sql.entities.UsuarioEntity verifyToken(String token);
}
