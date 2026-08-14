package com.agromarket.domain.user.ports.in;

import com.agromarket.application.dto.request.user.EmailVerificationRequest;

/**
 * Puerto de entrada que define las operaciones para la verificación de correo electrónico.
 * Incluye métodos para enviar correos de verificación y validar tokens/códigos.
 * 
 * @author AgroMarket Team
 */
public interface EmailVerificationService {
    
    /**
     * Envía un correo de verificación a una dirección de email.
     * 
     * @param email dirección de correo electrónico
     */
    void sendVerificationEmail(String email);
    
    /**
     * Verifica un token de verificación.
     * 
     * @param token token de verificación
     */
    void verifyEmail(String token);
    
    /**
     * Reenvía el correo de verificación.
     * 
     * @param email dirección de correo electrónico
     */
    void resendVerificationEmail(String email);
    
    /**
     * Verifica un token de verificación usando un request DTO.
     * 
     * @param request request con el token de verificación
     */
    void verifyEmailWithRequest(EmailVerificationRequest request);
}

