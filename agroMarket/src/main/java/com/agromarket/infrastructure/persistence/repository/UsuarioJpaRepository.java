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

    Optional<UsuarioEntity> findByGoogleId(String googleId);

    List<UsuarioEntity> findByRolAndAprobadoFalse(RolUsuario rol);

    Optional<UsuarioEntity> findByTokenVerificacionEmail(String token);

    Optional<UsuarioEntity> findByTokenVerificacionTelefono(String token);

    Optional<UsuarioEntity> findByTelefono(String telefono);

    List<UsuarioEntity> findByEstadoCuenta(String estadoCuenta);
    
    Optional<UsuarioEntity> findByTokenRecuperacionPassword(String token);

    @org.springframework.data.jpa.repository.Query("SELECT u.contrasena FROM UsuarioEntity u WHERE u.id = :id")
    Optional<String> findPasswordHashById(@org.springframework.data.repository.query.Param("id") Long id);
}
