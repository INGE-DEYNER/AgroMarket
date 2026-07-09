package com.agromarket.domain.services;

import java.util.List;

import com.agromarket.application.persistence.sql.entities.PasswordHistoryEntity;
import com.agromarket.application.persistence.sql.entities.UsuarioEntity;
import com.agromarket.application.persistence.sql.repositories.PasswordHistoryRepository;
import com.agromarket.application.persistence.sql.repositories.UsuarioJpaRepository;
import com.agromarket.domain.exception.CredencialesInvalidasException;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordPolicyService {
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final PasswordHistoryRepository passwordHistoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public void validarContrasenaRegistro(String nuevaContrasena) {
        validarNoUsadaPorOtroUsuario(null, nuevaContrasena);
    }

    @Transactional(readOnly = true)
    public void validarContrasenaNueva(UsuarioEntity usuario, String nuevaContrasena) {
        if (passwordEncoder.matches(nuevaContrasena, usuario.getContrasena())) {
            throw new CredencialesInvalidasException("No puedes reutilizar tu contraseña actual");
        }

        try {
            List<PasswordHistoryEntity> historial = passwordHistoryRepository.findByUsuarioId(usuario.getId());
            boolean reutilizada = historial.stream()
                    .anyMatch(entry -> passwordEncoder.matches(nuevaContrasena, entry.getContrasenaHash()));
            if (reutilizada) {
                throw new CredencialesInvalidasException("No puedes reutilizar una contraseña anterior");
            }
        } catch (CredencialesInvalidasException ex) {
            throw ex;
        } catch (Exception e) {
            log.warn("No se pudo verificar el historial de contraseñas para el usuario {} (posiblemente la tabla no existe): {}", usuario.getId(), e.getMessage());
        }

        validarNoUsadaPorOtroUsuario(usuario.getId(), nuevaContrasena);
    }

    @Transactional
    public void registrarContrasenaEnHistorial(UsuarioEntity usuario) {
        try {
            PasswordHistoryEntity entry = PasswordHistoryEntity.builder()
                    .usuario(usuario)
                    .contrasenaHash(usuario.getContrasena())
                    .build();
            passwordHistoryRepository.save(entry);
        } catch (Exception e) {
            log.warn("No se pudo registrar la contraseña en el historial para el usuario {} (posiblemente la tabla no existe): {}", usuario.getId(), e.getMessage());
        }
    }

    private void validarNoUsadaPorOtroUsuario(Long usuarioActualId, String nuevaContrasena) {
        // No-op: Removed for performance and security reasons. Comparing passwords of all users is an anti-pattern.
    }
}
