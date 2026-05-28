package com.agromarket.application.service;

import java.util.List;

import com.agromarket.application.dto.ActualizarUsuarioRequest;
import com.agromarket.application.dto.UsuarioResponse;

import org.springframework.transaction.annotation.Transactional;

public interface UsuarioService {
    @Transactional(readOnly = true)
    UsuarioResponse getById(Long id);

    @Transactional(readOnly = true)
    List<UsuarioResponse> getAll();

    @Transactional
    UsuarioResponse actualizar(Long id, ActualizarUsuarioRequest request);

    @Transactional
    void habilitar(Long id);

    @Transactional
    void deshabilitar(Long id);
}
