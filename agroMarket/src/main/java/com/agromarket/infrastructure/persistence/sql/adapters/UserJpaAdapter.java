package com.agromarket.infrastructure.persistence.sql.adapters;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import com.agromarket.application.mappers.UserMapper;
import com.agromarket.domain.user.enums.Role;
import com.agromarket.domain.user.model.User;
import com.agromarket.domain.user.ports.out.UserRepository;
import com.agromarket.infrastructure.persistence.sql.entities.UserEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.UserJpaRepository;

import lombok.RequiredArgsConstructor;

/**
 * Adaptador JPA que implementa el puerto UserRepository.
 * Este adaptador actúa como puente entre la capa de dominio y la capa de persistencia,
 * convirtiendo entre entidades de dominio (User) y entidades JPA (UserEntity).
 * 
 * <p>Centraliza todas las operaciones de persistencia relacionadas con usuarios,
 * evitando que el dominio dependa directamente de JPA o Spring Data.</p>
 * 
 * @author AgroMarket Team
 */
@Component
@RequiredArgsConstructor
public class UserJpaAdapter implements UserRepository {
    
    private final UserJpaRepository userJpaRepository;
    private final UserMapper userMapper;
    
    @Override
    public User save(User user) {
        UserEntity entity = userMapper.toEntity(user);
        UserEntity savedEntity = userJpaRepository.save(entity);
        return userMapper.toDomain(savedEntity);
    }
    
    @Override
    public Optional<User> findById(Long id) {
        return userJpaRepository.findById(id)
                .map(userMapper::toDomain);
    }
    
    @Override
    public Optional<User> findByEmail(String email) {
        return userJpaRepository.findByEmail(email)
                .map(userMapper::toDomain);
    }
    
    @Override
    public List<User> findAll() {
        return userJpaRepository.findAll().stream()
                .map(userMapper::toDomain)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<User> findByRole(String role) {
        try {
            Role enumRole = Role.valueOf(role.toUpperCase());
            return userJpaRepository.findByUserRoleAndAccountApprovedFalse(enumRole).stream()
                    .map(userMapper::toDomain)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }
    
    @Override
    public void deleteById(Long id) {
        userJpaRepository.deleteById(id);
    }
    
    @Override
    public boolean existsByEmail(String email) {
        return userJpaRepository.existsByEmail(email);
    }
    
    @Override
    public Optional<User> findByEmailVerificationToken(String token) {
        return userJpaRepository.findByEmailVerificationToken(token)
                .map(userMapper::toDomain);
    }
    
    @Override
    public Optional<User> findByPasswordResetToken(String token) {
        return userJpaRepository.findByPasswordResetToken(token)
                .map(userMapper::toDomain);
    }
}

