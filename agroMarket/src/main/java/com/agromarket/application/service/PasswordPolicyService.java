package com.agromarket.application.service;

import java.util.List;

import com.agromarket.domain.exception.CredencialesInvalidasException;
import com.agromarket.infrastructure.persistence.entity.PasswordHistoryEntity;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.PasswordHistoryRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
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

        List<PasswordHistoryEntity> historial = passwordHistoryRepository.findByUsuarioId(usuario.getId());
        boolean reutilizada = historial.stream()
                .anyMatch(entry -> passwordEncoder.matches(nuevaContrasena, entry.getContrasenaHash()));
        if (reutilizada) {
            throw new CredencialesInvalidasException("No puedes reutilizar una contraseña anterior");
        }

        validarNoUsadaPorOtroUsuario(usuario.getId(), nuevaContrasena);
    }

    @Transactional
    public void registrarContrasenaEnHistorial(UsuarioEntity usuario) {
        PasswordHistoryEntity entry = PasswordHistoryEntity.builder()
                .usuario(usuario)
                .contrasenaHash(usuario.getContrasena())
                .build();
        passwordHistoryRepository.save(entry);
    }

    private void validarNoUsadaPorOtroUsuario(Long usuarioActualId, String nuevaContrasena) {
        boolean usadaPorOtro = usuarioJpaRepository.findAll().stream()
                .filter(usuario -> usuarioActualId == null || !usuario.getId().equals(usuarioActualId))
                .anyMatch(usuario -> passwordEncoder.matches(nuevaContrasena, usuario.getContrasena()));

        if (usadaPorOtro) {
            throw new CredencialesInvalidasException("Esa contraseña ya está siendo usada por otro usuario");
        }
    }
}
