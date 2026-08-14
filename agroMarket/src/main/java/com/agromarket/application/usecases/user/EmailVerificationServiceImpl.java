package com.agromarket.application.usecases.user;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.application.dto.request.user.EmailVerificationRequest;
import com.agromarket.domain.user.exceptions.ResourceNotFoundException;
import com.agromarket.domain.user.model.EmailVerificationToken;
import com.agromarket.domain.user.model.User;
import com.agromarket.domain.user.ports.in.EmailVerificationService;
import com.agromarket.domain.user.ports.out.UserRepository;
import com.agromarket.infrastructure.email.BrevoEmailService;

import lombok.RequiredArgsConstructor;

/**
 * Implementación del servicio de verificación de correo electrónico.
 * Gestiona la generación de tokens de verificación, envío de correos
 * y validación de tokens.
 * 
 * @author AgroMarket Team
 */
@Service
@RequiredArgsConstructor
public class EmailVerificationServiceImpl implements EmailVerificationService {

    private final UserRepository userRepository;
    private final BrevoEmailService emailService;
    
    private static final long TOKEN_EXPIRATION_HOURS = 24;
    
    @Override
    @Transactional
    public void sendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con correo: " + email));
        
        // Generar token
        String token = UUID.randomUUID().toString();
        LocalDateTime expiry = LocalDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS);
        
        // Guardar token en el usuario
        user.setEmailVerificationToken(token);
        user.setEmailTokenExpiry(expiry);
        userRepository.save(user);
        
        // Enviar correo (simplificado - en producción usar template de correo)
        String verificationUrl = "https://agromarket.com/api/auth/verify-email?token=" + token;
        String subject = "Verifica tu correo electrónico - AgroMarket";
        String body = "Hola " + user.getFirstName() + ",\n\n" +
                     "Por favor haz clic en el siguiente enlace para verificar tu correo electrónico:\n" +
                     verificationUrl + "\n\n" +
                     "Este enlace expirará en " + TOKEN_EXPIRATION_HOURS + " horas.";
        
        emailService.sendSimpleMessage(email, subject, body);
    }
    
    @Override
    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Token de verificación no válido o expirado"));
        
        // Validar que el token no haya expirado
        if (user.getEmailTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ResourceNotFoundException("Token de verificación expirado");
        }
        
        // Marcar correo como verificado
        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailTokenExpiry(null);
        user.setAccountStatus("ACTIVE");
        
        userRepository.save(user);
    }
    
    @Override
    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con correo: " + email));
        
        // Validar que el usuario no esté ya verificado
        if (user.isEmailVerified()) {
            throw new IllegalStateException("El correo ya está verificado");
        }
        
        // Generar nuevo token y enviar correo
        sendVerificationEmail(email);
    }
    
    @Override
    @Transactional
    public void verifyEmailWithRequest(EmailVerificationRequest request) {
        verifyEmail(request.getToken());
    }
}
