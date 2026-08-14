package com.agromarket.infrastructure.persistence.sql.adapters;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.agromarket.domain.user.model.PasswordHistory;
import com.agromarket.infrastructure.persistence.sql.entities.PasswordHistoryEntity;

import lombok.RequiredArgsConstructor;

/**
 * Adaptador JPA que implementa el puerto PasswordHistoryRepository.
 * Este adaptador gestiona el historial de contraseñas de los usuarios para validar
 * que no se reutilicen contraseñas antiguas.
 * 
 * <p>Centraliza las operaciones de persistencia relacionadas con el historial de contraseñas,
 * evitando que el dominio dependa directamente de JPA o Spring Data.</p>
 * 
 * @author AgroMarket Team
 */
@Component
@RequiredArgsConstructor
public class PasswordHistoryJpaAdapter implements com.agromarket.domain.user.ports.out.PasswordHistoryRepository {

    private final com.agromarket.infrastructure.persistence.sql.repositories.PasswordHistoryRepository passwordHistoryRepository;
    
    @Override
    public PasswordHistory save(PasswordHistory passwordHistory) {
        PasswordHistoryEntity entity = new PasswordHistoryEntity();
        entity.setId(passwordHistory.getId());
        entity.setUserId(passwordHistory.getUserId());
        entity.setPasswordHash(passwordHistory.getPassword());
        entity.setChangedAt(passwordHistory.getUsedAt());
        
        PasswordHistoryEntity savedEntity = passwordHistoryRepository.save(entity);
        
        return PasswordHistory.builder()
                .id(savedEntity.getId())
                .userId(savedEntity.getUserId())
                .password(savedEntity.getPasswordHash())
                .usedAt(savedEntity.getChangedAt())
                .build();
    }
    
    @Override
    public List<PasswordHistory> findByUserId(Long userId) {
        return passwordHistoryRepository.findByUserId(userId).stream()
                .map(entity -> PasswordHistory.builder()
                        .id(entity.getId())
                        .userId(entity.getUserId())
                        .password(entity.getPasswordHash())
                        .usedAt(entity.getChangedAt())
                        .build())
                .collect(Collectors.toList());
    }
    
    @Override
    public boolean hasUsedPasswordBefore(Long userId, String password) {
        return passwordHistoryRepository.findByUserId(userId).stream()
                .anyMatch(entity -> entity.getPasswordHash().equals(password));
    }
}
