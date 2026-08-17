package com.agromarket.application.usecases.user;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.in.user.EmailVerificationPort;
import com.agromarket.domain.ports.out.user.EmailPort;
import com.agromarket.domain.ports.out.user.UserPort;
import com.agromarket.domain.services.user.TokenValidationService;

@Service
@Transactional
public class EmailVerificationUseCase implements EmailVerificationPort {

    private final UserPort userPort;
    private final EmailPort emailPort;
    private final TokenValidationService tokenValidationService;

    public EmailVerificationUseCase(
            UserPort userPort,
            EmailPort emailPort,
            TokenValidationService tokenValidationService) {
        this.userPort = userPort;
        this.emailPort = emailPort;
        this.tokenValidationService = tokenValidationService;
    }

    @Override
    public void sendVerificationEmail(String email) {
        User user = findByEmail(email);
        send(user);
    }

    @Override
    public void verifyEmail(String token) {
        User user = userPort.findByEmailVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token de verificación inválido"));

        if (!tokenValidationService.isEmailVerificationTokenValid(user, token)) {
            throw new IllegalArgumentException("Token de verificación expirado o inválido");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailTokenExpiry(null);
        user.setAccountStatus("ACTIVE");
        user.setAccountApproved(true);
        user.setUpdatedAt(LocalDateTime.now());

        userPort.save(user);
    }

    @Override
    public void resendVerificationEmail(String email) {
        User user = findByEmail(email);

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("El correo ya está verificado");
        }

        send(user);
    }

    private User findByEmail(String email) {
        return userPort.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }

    private void send(User user) {
        if (user.getEmailVerificationToken() == null
                || user.getEmailTokenExpiry() == null
                || user.getEmailTokenExpiry().isBefore(LocalDateTime.now())) {
            user.setEmailVerificationToken(java.util.UUID.randomUUID().toString());
            user.setEmailTokenExpiry(LocalDateTime.now().plusHours(24));
            user.setUpdatedAt(LocalDateTime.now());
            userPort.save(user);
        }

        emailPort.sendVerificationEmail(
                user.getEmail(),
                user.getEmailVerificationToken());
    }
}
