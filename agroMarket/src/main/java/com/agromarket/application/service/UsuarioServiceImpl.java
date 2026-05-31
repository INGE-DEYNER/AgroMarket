package com.agromarket.application.service;

import java.util.List;
import java.util.Objects;

import com.agromarket.application.dto.CambiarContrasenaRequest;
import com.agromarket.application.dto.ActualizarUsuarioRequest;
import com.agromarket.application.dto.UsuarioResponse;
import com.agromarket.application.mapper.UsuarioMapper;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse getById(Long id) {
        return usuarioMapper.toResponse(findUsuario(Objects.requireNonNull(id, "id")));
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse getPerfil(Long id) {
        return getById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponse> getAll() {
        return usuarioMapper.toResponseList(usuarioJpaRepository.findAll());
    }

    @Override
    @Transactional
    public UsuarioResponse actualizar(Long id, ActualizarUsuarioRequest request) {
        UsuarioEntity usuario = findUsuario(Objects.requireNonNull(id, "id"));
        usuario.setNombre(request.getNombre().trim());
        usuario.setTelefono(request.getTelefono().trim());
        return usuarioMapper.toResponse(usuarioJpaRepository.save(usuario));
    }

    @Override
    @Transactional
    public UsuarioResponse actualizarPerfil(Long id, ActualizarUsuarioRequest request) {
        return actualizar(id, request);
    }

    @Override
    @Transactional
    public void actualizarContrasena(Long id, CambiarContrasenaRequest request) {
        UsuarioEntity usuario = findUsuario(Objects.requireNonNull(id, "id"));
        if (!passwordEncoder.matches(request.getContrasenaActual(), usuario.getContrasena())) {
            throw new IllegalArgumentException("La contraseña actual no es correcta");
        }
        usuario.setContrasena(passwordEncoder.encode(request.getNuevaContrasena()));
        usuarioJpaRepository.save(usuario);
    }

    @Override
    @Transactional
    public void habilitar(Long id) {
        UsuarioEntity usuario = findUsuario(Objects.requireNonNull(id, "id"));
        usuario.setActivo(true);
        usuarioJpaRepository.save(usuario);
    }

    @Override
    @Transactional
    public void deshabilitar(Long id) {
        UsuarioEntity usuario = findUsuario(Objects.requireNonNull(id, "id"));
        usuario.setActivo(false);
        usuarioJpaRepository.save(usuario);
    }

    private UsuarioEntity findUsuario(Long id) {
        return usuarioJpaRepository.findById(Objects.requireNonNull(id, "id"))
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
    }
}
