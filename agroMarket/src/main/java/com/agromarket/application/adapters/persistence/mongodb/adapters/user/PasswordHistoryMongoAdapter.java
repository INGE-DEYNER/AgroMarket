package com.agromarket.application.adapters.persistence.mongodb.adapters.user;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.agromarket.application.adapters.persistence.mongodb.documents.user.PasswordHistoryDocument;
import com.agromarket.application.adapters.persistence.mongodb.repositories.user.PasswordHistoryMongoRepository;
import com.agromarket.domain.models.user.PasswordHistory;
import com.agromarket.domain.ports.out.user.PasswordHistoryPort;

@Component
@Profile("mongo")
public class PasswordHistoryMongoAdapter implements PasswordHistoryPort {

    private final PasswordHistoryMongoRepository repository;

    public PasswordHistoryMongoAdapter(PasswordHistoryMongoRepository repository) {
        this.repository = repository;
    }

    @Override
    public PasswordHistory save(PasswordHistory passwordHistory) {
        if (passwordHistory.getId() == null) {
            passwordHistory.setId(System.currentTimeMillis());
        }
        return repository.save(PasswordHistoryDocument.fromDomain(passwordHistory)).toDomain();
    }

    @Override
    public List<PasswordHistory> findByUserId(Long userId) {
        return repository.findByUserIdOrderByUsedAtDesc(userId)
                .stream().map(entity -> entity.toDomain()).toList();
    }

    @Override
    public boolean hasUsedPasswordBefore(Long userId, String password) {
        return repository.existsByUserIdAndPassword(userId, password);
    }
}
