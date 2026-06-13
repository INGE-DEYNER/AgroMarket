package com.agromarket.infrastructure.persistence.repository;

import java.util.Optional;
import java.util.List;
import com.agromarket.domain.model.RolUsuario;

import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioJpaRepository extends JpaRepository<UsuarioEntity, Long> {
    Optional<UsuarioEntity> findByCorreo(String correo);

    boolean existsByCorreo(String correo);

    boolean existsByTelefono(String telefono);

    List<UsuarioEntity> findByRolAndAprobadoFalse(RolUsuario rol);

    Optional<UsuarioEntity> findByGoogleId(String googleId);
}
