package com.agromarket.application.ports.in;

import java.util.List;

import com.agromarket.interfaces.rest.request.ActualizarUsuarioRequest;
import com.agromarket.interfaces.rest.request.CambiarContrasenaRequest;
import com.agromarket.interfaces.rest.response.UsuarioResponse;

import org.springframework.transaction.annotation.Transactional;

public interface UsuarioService {
    @Transactional(readOnly = true)
    UsuarioResponse getById(Long id);

    @Transactional(readOnly = true)
    UsuarioResponse getPerfil(Long id);

    @Transactional(readOnly = true)
    List<UsuarioResponse> getAll();

    @Transactional
    UsuarioResponse actualizar(Long id, ActualizarUsuarioRequest request);

    @Transactional
    UsuarioResponse actualizarPerfil(Long id, ActualizarUsuarioRequest request);

    @Transactional
    void actualizarContrasena(Long id, CambiarContrasenaRequest request);

    @Transactional
    void habilitar(Long id);

    @Transactional
    void deshabilitar(Long id);
}
