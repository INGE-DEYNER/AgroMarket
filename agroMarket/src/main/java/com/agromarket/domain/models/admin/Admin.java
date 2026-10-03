package com.agromarket.domain.models.admin;

import java.time.LocalDateTime;

import com.agromarket.domain.models.user.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Representa la información específica del administrador dentro del dominio.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Admin {

    private Long id;

    private User user;

    private boolean active;

    private LocalDateTime createdAt;

    /**
     * Verifica si el administrador puede ejecutar operaciones administrativas.
     *
     * @return true si está activo
     */
    public boolean canOperate() {
        return active && user != null && user.isActive();
    }
}