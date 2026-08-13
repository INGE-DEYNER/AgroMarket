package com.agromarket.infrastructure.persistence.adapters;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import com.agromarket.domain.models.Usuario;
import com.agromarket.domain.models.enums.RolUsuario;
import com.agromarket.domain.ports.out.UserRepositoryPort;
import com.agromarket.infrastructure.persistence.mapper.UsuarioMapper;
import com.agromarket.infrastructure.persistence.sql.entities.UsuarioEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.UsuarioJpaRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UsuarioJpaAdapter implements UserRepositoryPort {

    private final UsuarioJpaRepository usuarioJpaRepository;
    private final UsuarioMapper usuarioMapper;

    @Override
    public Optional<Usuario> findByEmail(String email) {
        return usuarioJpaRepository.findByCorreo(email)
                .map(usuarioMapper::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return usuarioJpaRepository.existsByCorreo(email);
    }

    @Override
    public List<Usuario> findAll() {
        return usuarioJpaRepository.findAll().stream()
                .map(usuarioMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Usuario> findById(Long id) {
        return usuarioJpaRepository.findById(id)
                .map(usuarioMapper::toDomain);
    }

    @Override
    public Usuario save(Usuario user) {
        UsuarioEntity entity = usuarioMapper.toEntity(user);
        UsuarioEntity savedEntity = usuarioJpaRepository.save(entity);
        return usuarioMapper.toDomain(savedEntity);
    }

    @Override
    public boolean existsByPhone(String phone) {
        return usuarioJpaRepository.existsByTelefono(phone);
    }

    @Override
    public Optional<Usuario> findByVerificationToken(String token) {
        return usuarioJpaRepository.findByTokenVerificacionEmail(token).map(usuarioMapper::toDomain);
    }

    @Override
    public void delete(Usuario user) {
        usuarioJpaRepository.delete(usuarioMapper.toEntity(user));
    }

    @Override
    public long count() {
        return usuarioJpaRepository.count();
    }

    @Override
    public List<Usuario> findByRolAndNotApproved(RolUsuario rol) {
        return usuarioJpaRepository.findByRolAndAprobadoFalse(rol).stream()
                .map(usuarioMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Usuario> findByAccountStatus(String status) {
        return usuarioJpaRepository.findByEstadoCuenta(status).stream()
                .map(usuarioMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Usuario> searchUsuarios(String search, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.DESC, "id"));
        Page<UsuarioEntity> pageResult = usuarioJpaRepository.searchUsuarios(search, pageable);
        return pageResult.getContent().stream()
                .map(usuarioMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public long countSearchUsuarios(String search) {
        Pageable pageable = PageRequest.of(0, 1);
        Page<UsuarioEntity> pageResult = usuarioJpaRepository.searchUsuarios(search, pageable);
        return pageResult.getTotalElements();
    }

    @Override
    public List<Usuario> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.DESC, "id"));
        Page<UsuarioEntity> pageResult = usuarioJpaRepository.findAll(pageable);
        return pageResult.getContent().stream()
                .map(usuarioMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public long countAll() {
        return usuarioJpaRepository.count();
    }
}
