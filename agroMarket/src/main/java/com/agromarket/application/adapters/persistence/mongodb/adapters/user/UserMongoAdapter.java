package com.agromarket.application.adapters.persistence.mongodb.adapters.user;

import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.agromarket.application.adapters.persistence.mongodb.documents.user.UserDocument;
import com.agromarket.application.adapters.persistence.mongodb.repositories.user.UserMongoRepository;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.out.user.UserPort;

@Component
@Profile("mongo")
public class UserMongoAdapter implements UserPort {

    private final UserMongoRepository repository;

    public UserMongoAdapter(UserMongoRepository repository) {
        this.repository = repository;
    }

    @Override
    public User save(User user) {
        if (user.getId() == null) {
            user.setId(System.currentTimeMillis());
        }
        return repository.save(UserDocument.fromDomain(user)).toDomain();
    }

    @Override
    public Optional<User> findById(Long id) {
        return repository.findByDomainId(id).map(entity -> entity.toDomain());
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return repository.findByEmail(email).map(entity -> entity.toDomain());
    }

    @Override
    public List<User> findAll() {
        return repository.findAll().stream().map(entity -> entity.toDomain()).toList();
    }

    @Override
    public List<User> findByRole(String role) {
        return repository.findByRole(
                com.agromarket.domain.models.enums.user.Role.valueOf(role.toUpperCase()))
                .stream().map(entity -> entity.toDomain()).toList();
    }

    @Override
    public void deleteById(Long id) {
        repository.findByDomainId(id).ifPresent(repository::delete);
    }

    @Override
    public boolean existsByEmail(String email) {
        return repository.existsByEmail(email);
    }

    @Override
    public Optional<User> findByEmailVerificationToken(String token) {
        return repository.findByEmailVerificationToken(token).map(entity -> entity.toDomain());
    }

    @Override
    public Optional<User> findByPasswordResetToken(String token) {
        return repository.findByPasswordResetToken(token).map(entity -> entity.toDomain());
    }

    @Override
    public void changePassword(Long id, String newPassword) {
        User user = findById(id).orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        user.setPassword(newPassword);
        save(user);
    }
}
