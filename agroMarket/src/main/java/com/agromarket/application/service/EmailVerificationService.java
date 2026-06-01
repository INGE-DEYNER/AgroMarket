package com.agromarket.application.service;

import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;

public interface EmailVerificationService {
    void sendVerificationEmail(UsuarioEntity usuario);
    void sendVerificationEmail(String correo);

    com.agromarket.infrastructure.persistence.entity.UsuarioEntity verifyCode(String correo, String codigo);

    com.agromarket.infrastructure.persistence.entity.UsuarioEntity verifyToken(String token);
}
