package com.agromarket.application.usecases.user;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.domain.user.exceptions.InvalidCredentialsException;
import com.agromarket.domain.user.model.PasswordHistory;
import com.agromarket.domain.user.model.User;
import com.agromarket.domain.user.ports.out.PasswordHistoryRepository;
import com.agromarket.domain.user.ports.out.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Servicio que gestiona las políticas de contraseñas.
 * Valida que las contraseñas cumplan con los requisitos de seguridad
 * y que no se reutilicen contraseñas antiguas.
 * 
 * @author AgroMarket Team
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordPolicyService {
    private final UserRepository userRepository;
    private final PasswordHistoryRepository passwordHistoryRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * Valida que una contraseña cumpla con las políticas para registro.
     * 
     * @param newPassword contraseña a validar
     */
    @Transactional(readOnly = true)
    public void validatePasswordForRegistration(String newPassword) {
        // Validación básica (longitud, complejidad, etc.) debe hacerse en la capa de API
        // Aquí solo validamos contra políticas de negocio
    }
    
    /**
     * Valida que una nueva contraseña cumpla con las políticas.
     * 
     * @param user usuario actual
     * @param newPassword nueva contraseña a validar
     */
    @Transactional(readOnly = true)
    public void validateNewPassword(User user, String newPassword) {
        // Validar que no sea igual a la contraseña actual
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new InvalidCredentialsException("No puedes reutilizar tu contraseña actual");
        }
        
        try {
            // Validar que no haya sido usada antes
            List<PasswordHistory> history = passwordHistoryRepository.findByUserId(user.getId());
            boolean reused = history.stream()
                    .anyMatch(passwordHistory -> passwordEncoder.matches(newPassword, passwordHistory.getPassword()));
            if (reused) {
                throw new InvalidCredentialsException("No puedes reutilizar una contraseña anterior");
            }
        } catch (InvalidCredentialsException ex) {
            throw ex;
        } catch (Exception e) {
            log.warn("No se pudo verificar el historial de contraseñas para el usuario {}: {}", 
                     user.getId(), e.getMessage());
        }
    }
    
    /**
     * Registra una contraseña en el historial del usuario.
     * 
     * @param user usuario
     */
    @Transactional
    public void savePasswordToHistory(User user) {
        try {
            PasswordHistory passwordHistory = PasswordHistory.builder()
                    .userId(user.getId())
                    .password(user.getPassword())
                    .usedAt(java.time.LocalDateTime.now())
                    .build();
            passwordHistoryRepository.save(passwordHistory);
        } catch (Exception e) {
            log.warn("No se pudo registrar la contraseña en el historial para el usuario {}: {}", 
                     user.getId(), e.getMessage());
        }
    }
}
