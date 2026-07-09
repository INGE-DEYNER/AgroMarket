package com.agromarket.domain.ports;

import java.util.List;
import java.util.Optional;

import com.agromarket.domain.models.Usuario;

public interface UsuarioRepository {
    Optional<Usuario> findByCorreo(String correo);

    boolean existsByCorreo(String correo);

    List<Usuario> findAll();

    Optional<Usuario> findById(Long id);

    Usuario save(Usuario usuario);
}
