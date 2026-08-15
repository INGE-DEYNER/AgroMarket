package com.agromarket.application.adapters.persistence.sql.adapters.user;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.agromarket.application.adapters.persistence.sql.entities.user.PasswordHistoryEntity;
import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.user.PasswordHistoryJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.user.UserJpaRepository;
import com.agromarket.domain.models.user.PasswordHistory;
import com.agromarket.domain.ports.out.user.PasswordHistoryPort;

@Component
@Profile("sql")
public class PasswordHistorySqlAdapter implements PasswordHistoryPort {

    private final PasswordHistoryJpaRepository repository;
    private final UserJpaRepository userRepository;

    public PasswordHistorySqlAdapter(
            PasswordHistoryJpaRepository repository,
            UserJpaRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    @Override
    public PasswordHistory save(PasswordHistory passwordHistory) {
        UserEntity user = userRepository.findById(passwordHistory.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        return repository.save(
                PasswordHistoryEntity.fromDomain(passwordHistory, user))
                .toDomain();
    }

    @Override
    public List<PasswordHistory> findByUserId(Long userId) {
        return repository.findByUser_IdOrderByUsedAtDesc(userId)
                .stream().map(PasswordHistoryEntity::toDomain).toList();
    }

    @Override
    public boolean hasUsedPasswordBefore(Long userId, String password) {
        return repository.existsByUser_IdAndPassword(userId, password);
    }
}
