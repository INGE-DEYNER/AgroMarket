package com.agromarket.application.service;

import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;

public interface EmailVerificationService {
    void sendVerificationEmail(UsuarioEntity usuario);
    void sendVerificationEmail(String correo);

    void verifyToken(String token);
}
