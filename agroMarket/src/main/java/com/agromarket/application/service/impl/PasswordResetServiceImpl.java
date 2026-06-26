package com.agromarket.application.service.impl;

import com.agromarket.application.service.EmailService;
import com.agromarket.application.service.PasswordPolicyService;
import com.agromarket.application.service.PasswordResetService;
import com.agromarket.domain.exception.CredencialesInvalidasException;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UsuarioJpaRepository usuarioRepository;
    private final EmailService brevoEmailService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordPolicyService passwordPolicyService;

    @Override
    @Transactional
    public void requestPasswordReset(String email) {
        UsuarioEntity usuario = usuarioRepository.findByCorreo(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe cuenta con ese correo"));

        // SecureRandom para evitar predictibilidad del código
        String codigo = String.format("%06d", new SecureRandom().nextInt(999999));
        LocalDateTime expira = LocalDateTime.now().plusMinutes(15);

        usuario.setTokenRecuperacionPassword(codigo);
        usuario.setTokenRecuperacionExpira(expira);
        usuarioRepository.save(usuario);

        try {
            brevoEmailService.sendPasswordResetEmail(
                    email,
                    usuario.getNombre(),
                    codigo,
                    "es"
            );
            log.info("Email de recuperación enviado a: {}", email);
        } catch (Exception e) {
            log.error("Error enviando email de recuperación a {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("No se pudo enviar el email. Intenta de nuevo en unos minutos.");
        }
    }

    @Override
    @Transactional
    public String verifyCode(String email, String codigo) {
        log.info("verifyCode — intentando verificar código para: {}", email);

        UsuarioEntity usuario = usuarioRepository.findByCorreo(email)
                .orElseThrow(() -> {
                    log.warn("verifyCode — usuario no encontrado para correo: {}", email);
                    return new CredencialesInvalidasException("Código inválido o expirado");
                });

        String storedToken = usuario.getTokenRecuperacionPassword();
        LocalDateTime expira = usuario.getTokenRecuperacionExpira();

        // Verificar expiración primero para dar log más descriptivo
        if (expira == null || LocalDateTime.now().isAfter(expira)) {
            log.warn("verifyCode — token expirado para usuario: {}. Expiró: {}", email, expira);
            throw new CredencialesInvalidasException("El código ha expirado. Solicita uno nuevo.");
        }

        // Comparar código ingresado vs almacenado
        if (storedToken == null || !codigo.equals(storedToken)) {
            log.warn("verifyCode — código incorrecto para usuario: {}. Recibido: '{}', Almacenado (primeros 2 chars): '{}'",
                    email, codigo, storedToken != null && storedToken.length() >= 2 ? storedToken.substring(0, 2) + "****" : "null");
            throw new CredencialesInvalidasException("Código incorrecto. Verifica e intenta de nuevo.");
        }

        String tokenTemporal = UUID.randomUUID().toString();
        usuario.setTokenRecuperacionPassword(tokenTemporal);
        usuario.setTokenRecuperacionExpira(LocalDateTime.now().plusMinutes(10));
        usuarioRepository.save(usuario);

        log.info("verifyCode — código verificado exitosamente para: {}. Token temporal generado.", email);
        return tokenTemporal;
    }

    @Override
    @Transactional
    public void resetPassword(String token, String nuevaContrasena) {
        UsuarioEntity usuario = usuarioRepository.findByTokenRecuperacionPassword(token)
                .orElseThrow(() -> new CredencialesInvalidasException("Token expirado. Solicita nuevo código."));

        if (LocalDateTime.now().isAfter(usuario.getTokenRecuperacionExpira())) {
            throw new CredencialesInvalidasException("Token expirado. Solicita nuevo código.");
        }
        
        passwordPolicyService.validarContrasenaNueva(usuario, nuevaContrasena);
        usuario.setContrasena(passwordEncoder.encode(nuevaContrasena));
        usuario.setTokenRecuperacionPassword(null);
        usuario.setTokenRecuperacionExpira(null);
        usuarioRepository.save(usuario);
    }
}

