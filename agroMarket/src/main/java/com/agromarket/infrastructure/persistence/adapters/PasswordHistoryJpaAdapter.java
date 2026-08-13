package com.agromarket.infrastructure.persistence.adapters;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.agromarket.domain.ports.out.PasswordHistoryRepositoryPort;
import com.agromarket.infrastructure.persistence.sql.entities.PasswordHistoryEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.PasswordHistoryRepository;
import com.agromarket.infrastructure.persistence.sql.repositories.UsuarioJpaRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PasswordHistoryJpaAdapter implements PasswordHistoryRepositoryPort {

    private final PasswordHistoryRepository passwordHistoryRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;

    @Override
    public List<String> getPasswordHistoryHashes(Long userId) {
        return passwordHistoryRepository.findByUsuarioId(userId).stream()
                .map(PasswordHistoryEntity::getContrasenaHash)
                .collect(Collectors.toList());
    }

    @Override
    public void savePasswordHash(Long userId, String passwordHash) {
        usuarioJpaRepository.findById(userId).ifPresent(usuarioEntity -> {
            PasswordHistoryEntity entry = PasswordHistoryEntity.builder()
                    .usuario(usuarioEntity)
                    .contrasenaHash(passwordHash)
                    .build();
            passwordHistoryRepository.save(entry);
        });
    }
}
