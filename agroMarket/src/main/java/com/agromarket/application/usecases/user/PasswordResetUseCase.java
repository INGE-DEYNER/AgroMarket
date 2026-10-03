package com.agromarket.application.usecases.user;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.domain.models.user.PasswordHistory;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.in.user.PasswordResetPort;
import com.agromarket.domain.ports.out.user.EmailPort;
import com.agromarket.domain.ports.out.user.PasswordHashPort;
import com.agromarket.domain.ports.out.user.PasswordHistoryPort;
import com.agromarket.domain.ports.out.user.UserPort;
import com.agromarket.domain.services.user.PasswordPolicyService;
import com.agromarket.domain.services.user.TokenValidationService;

@Service
@Transactional
public class PasswordResetUseCase implements PasswordResetPort {

    private final UserPort userPort;
    private final PasswordHistoryPort passwordHistoryPort;
    private final PasswordHashPort passwordHashPort;
    private final EmailPort emailPort;
    private final PasswordPolicyService passwordPolicyService;
    private final TokenValidationService tokenValidationService;

    public PasswordResetUseCase(
            UserPort userPort,
            PasswordHistoryPort passwordHistoryPort,
            PasswordHashPort passwordHashPort,
            EmailPort emailPort,
            PasswordPolicyService passwordPolicyService,
            TokenValidationService tokenValidationService) {
        this.userPort = userPort;
        this.passwordHistoryPort = passwordHistoryPort;
        this.passwordHashPort = passwordHashPort;
        this.emailPort = emailPort;
        this.passwordPolicyService = passwordPolicyService;
        this.tokenValidationService = tokenValidationService;
    }

    @Override
    public void requestPasswordReset(String email) {
        User user = userPort.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusMinutes(30));
        user.setUpdatedAt(LocalDateTime.now());

        User saved = userPort.save(user);
        emailPort.sendPasswordResetEmail(saved.getEmail(), token);
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        User user = userPort.findByPasswordResetToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token de recuperación inválido"));

        if (!tokenValidationService.isPasswordResetTokenValid(user, token)) {
            throw new IllegalArgumentException("Token de recuperación expirado o inválido");
        }

        changePasswordInternal(user, newPassword);

        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());
        userPort.save(user);
    }

    @Override
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userPort.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (!passwordHashPort.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("La contraseña actual no es correcta");
        }

        changePasswordInternal(user, newPassword);
        user.setUpdatedAt(LocalDateTime.now());
        userPort.save(user);
    }

    private void changePasswordInternal(User user, String rawPassword) {
        passwordPolicyService.validate(rawPassword);

        String hashed = passwordHashPort.hash(rawPassword);

        if (passwordHistoryPort.hasUsedPasswordBefore(user.getId(), hashed)) {
            throw new IllegalArgumentException("La contraseña ya fue utilizada anteriormente");
        }

        if (user.getPassword() != null) {
            passwordHistoryPort.save(PasswordHistory.builder()
                    .userId(user.getId())
                    .password(user.getPassword())
                    .usedAt(LocalDateTime.now())
                    .build());
        }

        user.setPassword(hashed);
    }
}
