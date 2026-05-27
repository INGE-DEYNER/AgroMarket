package com.agromarket.application.service;

import java.util.List;

import com.agromarket.application.dto.ActualizarUsuarioRequest;
import com.agromarket.application.dto.UsuarioResponse;

public interface UsuarioService {
    UsuarioResponse getById(Long id);

    List<UsuarioResponse> getAll();

    UsuarioResponse actualizar(Long id, ActualizarUsuarioRequest request);

    void habilitar(Long id);

    void deshabilitar(Long id);
}
