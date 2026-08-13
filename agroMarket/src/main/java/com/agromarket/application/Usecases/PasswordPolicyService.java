package com.agromarket.application.usecases;

import java.util.List;

import com.agromarket.domain.models.Usuario;
import com.agromarket.domain.ports.out.PasswordHistoryRepositoryPort;
import com.agromarket.domain.ports.out.UserRepositoryPort;
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
    private final UserRepositoryPort userRepositoryPort;
    private final PasswordHistoryRepositoryPort passwordHistoryRepositoryPort;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public void validarContrasenaRegistro(String nuevaContrasena) {
        validarNoUsadaPorOtroUsuario(null, nuevaContrasena);
    }

    @Transactional(readOnly = true)
    public void validarContrasenaNuevaDomain(Usuario usuario, String nuevaContrasena) {
        if (passwordEncoder.matches(nuevaContrasena, usuario.getContrasena())) {
            throw new CredencialesInvalidasException("No puedes reutilizar tu contraseña actual");
        }

        try {
            List<String> historialHashes = passwordHistoryRepositoryPort.getPasswordHistoryHashes(usuario.getId());
            boolean reutilizada = historialHashes.stream()
                    .anyMatch(hash -> passwordEncoder.matches(nuevaContrasena, hash));
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
    public void registrarContrasenaEnHistorialDomain(Usuario usuario) {
        try {
            passwordHistoryRepositoryPort.savePasswordHash(usuario.getId(), usuario.getContrasena());
        } catch (Exception e) {
            log.warn("No se pudo registrar la contraseña en el historial para el usuario {} (posiblemente la tabla no existe): {}", usuario.getId(), e.getMessage());
        }
    }

    private void validarNoUsadaPorOtroUsuario(Long usuarioActualId, String nuevaContrasena) {
        // No-op: Removed for performance and security reasons. Comparing passwords of all users is an anti-pattern.
    }
}
