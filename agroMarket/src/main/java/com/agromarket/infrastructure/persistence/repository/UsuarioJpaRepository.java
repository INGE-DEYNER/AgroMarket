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

    @org.springframework.data.jpa.repository.Query("SELECT u FROM UsuarioEntity u WHERE LOWER(u.nombre) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.correo) LIKE LOWER(CONCAT('%', :search, '%'))")
    org.springframework.data.domain.Page<UsuarioEntity> searchUsuarios(@org.springframework.data.repository.query.Param("search") String search, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "UPDATE usuarios SET rol = :rol WHERE id = :id", nativeQuery = true)
    void updateUserRoleNatively(@org.springframework.data.repository.query.Param("id") Long id, @org.springframework.data.repository.query.Param("rol") String rol);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "UPDATE usuarios SET aprobado = :aprobado WHERE id = :id", nativeQuery = true)
    void updateUserApprovalNatively(@org.springframework.data.repository.query.Param("id") Long id, @org.springframework.data.repository.query.Param("aprobado") boolean aprobado);
}
