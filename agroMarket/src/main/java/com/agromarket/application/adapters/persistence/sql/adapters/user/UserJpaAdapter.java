package com.agromarket.application.adapters.persistence.sql.adapters.user;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.user.UserJpaRepository;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.out.user.UserPort;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
@Transactional
public class UserJpaAdapter implements UserPort {

    private final UserJpaRepository repository;

    @Override
    public User save(User user) {

        return repository.save(
                UserEntity.fromDomain(user)
        ).toDomain();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findById(Long id) {

        return repository.findById(id)
                .map(UserEntity::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {

        return repository.findByEmail(email)
                .map(UserEntity::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> findAll() {

        return repository.findAll()
                .stream()
                .map(UserEntity::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> findByRole(String role) {

        return repository.findByRole(
                com.agromarket.domain.models.enums.user.Role
                        .valueOf(role.toUpperCase())
        )
        .stream()
        .map(UserEntity::toDomain)
        .toList();
    }

    @Override
    public void deleteById(Long id) {

        repository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {

        return repository.existsByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByEmailVerificationToken(
            String token) {

        return repository.findByEmailVerificationToken(token)
                .map(UserEntity::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByPasswordResetToken(
            String token) {

        return repository.findByPasswordResetToken(token)
                .map(UserEntity::toDomain);
    }

    @Override
    public void changePassword(
            Long id,
            String newPassword) {

        User user = findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Usuario no encontrado"));

        user.setPassword(newPassword);

        save(user);
    }
}
