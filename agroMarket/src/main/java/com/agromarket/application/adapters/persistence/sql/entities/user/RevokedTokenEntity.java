package com.agromarket.application.adapters.persistence.sql.entities.user;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Token revocado al cerrar sesion.
 *
 * <p>Existe para que la revocacion sobreviva a un reinicio y sea visible desde
 * cualquier instancia. Con la lista en memoria, un token revocado volvia a
 * valer al reiniciar el contenedor, y con dos instancias revocar en una no
 * hacia nada en la otra.
 *
 * <p>La clave primaria es el propio {@code jti}: es unico por token, asi que
 * no hace falta un id aparte, y revocar dos veces el mismo token no duplica
 * filas.
 *
 * <p>{@code expiresAt} es el indice que usa la purga horaria: no guarda mas
 * alla de cuando el token habria expirado, que es cuando deja de importar.
 */
@Entity
@Table(name = "revoked_tokens",
        indexes = {
                @Index(name = "idx_revoked_token_expires", columnList = "expires_at")
        })
@Getter
@Setter
@NoArgsConstructor
public class RevokedTokenEntity {

    /**
     * Identificador unico del token (claim "jti" del JWT).
     * Es varchar y no un id numerico porque es la clave natural.
     */
    @Id
    @Column(name = "jti", length = 64, nullable = false)
    private String jti;

    @Column(name = "revoked_at", nullable = false)
    private Instant revokedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    public RevokedTokenEntity(String jti, Instant revokedAt, Instant expiresAt) {
        this.jti = jti;
        this.revokedAt = revokedAt;
        this.expiresAt = expiresAt;
    }
}