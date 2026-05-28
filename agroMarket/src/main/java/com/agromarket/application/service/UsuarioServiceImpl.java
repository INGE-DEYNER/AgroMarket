package com.agromarket.application.service;

import java.util.List;

import com.agromarket.application.dto.ActualizarUsuarioRequest;
import com.agromarket.application.dto.UsuarioResponse;
import com.agromarket.application.mapper.UsuarioMapper;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final UsuarioMapper usuarioMapper;

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse getById(Long id) {
        return usuarioMapper.toResponse(findUsuario(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponse> getAll() {
        return usuarioMapper.toResponseList(usuarioJpaRepository.findAll());
    }

    @Override
    @Transactional
    public UsuarioResponse actualizar(Long id, ActualizarUsuarioRequest request) {
        UsuarioEntity usuario = findUsuario(id);
        usuario.setNombre(request.getNombre());
        usuario.setTelefono(request.getTelefono());
        return usuarioMapper.toResponse(usuarioJpaRepository.save(usuario));
    }

    @Override
    @Transactional
    public void habilitar(Long id) {
        UsuarioEntity usuario = findUsuario(id);
        usuario.setActivo(true);
        usuarioJpaRepository.save(usuario);
    }

    @Override
    @Transactional
    public void deshabilitar(Long id) {
        UsuarioEntity usuario = findUsuario(id);
        usuario.setActivo(false);
        usuarioJpaRepository.save(usuario);
    }

    private UsuarioEntity findUsuario(Long id) {
        return usuarioJpaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
    }
}
