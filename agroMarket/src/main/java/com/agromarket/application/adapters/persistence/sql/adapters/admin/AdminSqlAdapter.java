package com.agromarket.application.adapters.persistence.sql.adapters.admin;

import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.application.adapters.persistence.sql.entities.admin.AdminEntity;
import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.admin.AdminJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.user.UserJpaRepository;
import com.agromarket.domain.models.admin.Admin;
import com.agromarket.domain.ports.out.admin.AdminPort;

import lombok.RequiredArgsConstructor;

/**
 * Adaptador de persistencia de administradores en MySQL
 * (reemplaza a AdminMongoAdapter): los administradores son datos
 * estructurales del negocio.
 */
@Component
@Profile("sql")
@RequiredArgsConstructor
@Transactional
public class AdminSqlAdapter implements AdminPort {

    private final AdminJpaRepository repository;
    private final UserJpaRepository userRepository;

    @Override
    public Admin save(Admin admin) {
        UserEntity user = admin.getUser() == null || admin.getUser().getId() == null
                ? null
                : userRepository.getReferenceById(admin.getUser().getId());
        return repository.save(AdminEntity.fromDomain(admin, user))
                .toDomain();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Admin> findById(Long id) {
        return repository.findById(id)
                .map(AdminEntity::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Admin> findByUserId(Long userId) {
        return repository.findByUserId(userId)
                .map(AdminEntity::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Admin> findActive() {
        return repository.findByActiveTrue()
                .stream()
                .map(AdminEntity::toDomain)
                .toList();
    }
}
