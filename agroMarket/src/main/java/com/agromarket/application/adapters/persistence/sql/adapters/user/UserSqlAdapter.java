package com.agromarket.application.adapters.persistence.sql.adapters.user;

import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.user.UserJpaRepository;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.out.user.UserPort;

@Component
@Profile("sql")
public class UserSqlAdapter implements UserPort {

    private final UserJpaRepository repository;

    public UserSqlAdapter(UserJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public User save(User user) {
        return repository.save(UserEntity.fromDomain(user)).toDomain();
    }

    @Override
    public Optional<User> findById(Long id) {
        return repository.findById(id).map(UserEntity::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return repository.findByEmail(email).map(UserEntity::toDomain);
    }

    @Override
    public List<User> findAll() {
        return repository.findAll().stream().map(UserEntity::toDomain).toList();
    }

    @Override
    public List<User> findByRole(String role) {
        return repository.findByRole(
                com.agromarket.domain.models.enums.user.Role.valueOf(role.toUpperCase()))
                .stream().map(UserEntity::toDomain).toList();
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    @Override
    public boolean existsByEmail(String email) {
        return repository.existsByEmail(email);
    }

    @Override
    public Optional<User> findByEmailVerificationToken(String token) {
        return repository.findByEmailVerificationToken(token).map(UserEntity::toDomain);
    }

    @Override
    public Optional<User> findByPasswordResetToken(String token) {
        return repository.findByPasswordResetToken(token).map(UserEntity::toDomain);
    }

    @Override
    public void changePassword(Long id, String newPassword) {
        User user = findById(id).orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        user.setPassword(newPassword);
        save(user);
    }
}
