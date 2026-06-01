package com.agromarket.infrastructure.persistence.entity;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.agromarket.domain.model.RolUsuario;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usuarios")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "rol")
public abstract class UsuarioEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String correo;

    @Column(nullable = false)
    private String contrasena;

    @Column(nullable = false)
    private String telefono;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, insertable = false, updatable = false)
    private RolUsuario rol;

    @Column(nullable = false)
    @Builder.Default
    private boolean activo = true;
    
    @Column(nullable = false)
    @Builder.Default
    private boolean aprobado = true;

    @Column(name = "totp_enabled", nullable = false)
    @Builder.Default
    private boolean totpEnabled = false;

    @Column(name = "totp_secret")
    private String totpSecret;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    // Explicit setter to satisfy IDE / LSP when Lombok annotation processing is unavailable
    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public boolean isAprobado() {
        return this.aprobado;
    }

    public void setAprobado(boolean aprobado) {
        this.aprobado = aprobado;
    }

    public boolean isTotpEnabled() {
        return this.totpEnabled;
    }

    public void setTotpEnabled(boolean totpEnabled) {
        this.totpEnabled = totpEnabled;
    }

    public String getTotpSecret() {
        return this.totpSecret;
    }

    public void setTotpSecret(String totpSecret) {
        this.totpSecret = totpSecret;
    }

    // Explicit getters to reduce IDE diagnostics when Lombok isn't initialized
    public Long getId() {
        return this.id;
    }

    public String getCorreo() {
        return this.correo;
    }

    public String getNombre() {
        return this.nombre;
    }

    public RolUsuario getRol() {
        return this.rol;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }
}
