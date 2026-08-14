package com.agromarket.application.usecases.user;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.domain.user.exceptions.ResourceNotFoundException;
import com.agromarket.domain.user.model.User;
import com.agromarket.domain.user.ports.in.PasswordResetService;
import com.agromarket.domain.user.ports.out.PasswordHistoryRepository;
import com.agromarket.domain.user.ports.out.UserRepository;
import com.agromarket.infrastructure.email.BrevoEmailService;

import lombok.RequiredArgsConstructor;

/**
 * Implementación del servicio de recuperación de contraseña.
 * Gestiona la generación de tokens de recuperación, envío de correos
 * y restablecimiento de contraseñas.
 * 
 * @author AgroMarket Team
 */
@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordHistoryRepository passwordHistoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final BrevoEmailService emailService;
    
    private static final long TOKEN_EXPIRATION_HOURS = 1;
    private static final int MAX_PASSWORD_HISTORY = 5;
    
    @Override
    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElse(null); // No revelar si el correo existe o no por seguridad
        
        if (user != null) {
            // Generar token
            String token = UUID.randomUUID().toString();
            LocalDateTime expiry = LocalDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS);
            
            // Guardar token en el usuario
            user.setPasswordResetToken(token);
            user.setPasswordResetTokenExpiry(expiry);
            userRepository.save(user);
            
            // Enviar correo
            String resetUrl = "https://agromarket.com/reset-password?token=" + token;
            String subject = "Restablece tu contraseña - AgroMarket";
            String body = "Hola " + user.getFirstName() + ",\n\n" +
                         "Recibimos una solicitud para restablecer tu contraseña.\n" +
                         "Por favor haz clic en el siguiente enlace:\n" +
                         resetUrl + "\n\n" +
                         "Este enlace expirará en " + TOKEN_EXPIRATION_HOURS + " hora.\n" +
                         "Si no solicitaste esto, ignora este correo.";
            
            emailService.sendSimpleMessage(email, subject, body);
        }
        
        // No revelar si el correo existe o no por seguridad
    }
    
    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Token de recuperación no válido o expirado"));
        
        // Validar que el token no haya expirado
        if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ResourceNotFoundException("Token de recuperación expirado");
        }
        
        // Validar que la nueva contraseña no sea igual a la actual
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("La nueva contraseña no puede ser igual a la contraseña actual");
        }
        
        // Validar que la nueva contraseña no haya sido usada antes
        boolean usedBefore = passwordHistoryRepository.hasUsedPasswordBefore(user.getId(), passwordEncoder.encode(newPassword));
        if (usedBefore) {
            throw new IllegalArgumentException("Esta contraseña ha sido usada antes. Por favor elige una contraseña diferente.");
        }
        
        // Guardar la contraseña actual en el historial
        savePasswordToHistory(user.getId(), user.getPassword());
        
        // Actualizar contraseña
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        
        userRepository.save(user);
    }
    
    @Override
    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        
        // Validar contraseña actual
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("La contraseña actual no es correcta");
        }
        
        // Validar que la nueva contraseña no sea igual a la actual
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("La nueva contraseña no puede ser igual a la contraseña actual");
        }
        
        // Validar que la nueva contraseña no haya sido usada antes
        boolean usedBefore = passwordHistoryRepository.hasUsedPasswordBefore(user.getId(), passwordEncoder.encode(newPassword));
        if (usedBefore) {
            throw new IllegalArgumentException("Esta contraseña ha sido usada antes. Por favor elige una contraseña diferente.");
        }
        
        // Guardar la contraseña actual en el historial
        savePasswordToHistory(user.getId(), user.getPassword());
        
        // Actualizar contraseña
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
    
    private void savePasswordToHistory(Long userId, String passwordHash) {
        // Guardar en el historial de contraseñas
        // Limitado a MAX_PASSWORD_HISTORY registros
        var history = passwordHistoryRepository.findByUserId(userId);
        
        if (history.size() >= MAX_PASSWORD_HISTORY) {
            // Eliminar el registro más antiguo (simplificado - en producción usar consulta native)
            // Por ahora, solo guardamos el nuevo
        }
        
        com.agromarket.domain.user.model.PasswordHistory passwordHistory = com.agromarket.domain.user.model.PasswordHistory.builder()
                .userId(userId)
                .password(passwordHash)
                .usedAt(LocalDateTime.now())
                .build();
        
        passwordHistoryRepository.save(passwordHistory);
    }
}
