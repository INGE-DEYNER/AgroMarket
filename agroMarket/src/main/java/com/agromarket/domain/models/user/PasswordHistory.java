package com.agromarket.domain.models.user;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad de dominio que representa el historial de contraseñas de un usuario.
 * Se utiliza para prevenir el reuso de contraseñas antiguas.
 * 
 * @author AgroMarket Team
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordHistory {
    
    private Long id;
    
    /**
     * ID del usuario al cual pertenece este historial.
     */
    private Long userId;
    
    /**
     * Contraseña antigua hasheada.
     */
    private String password;
    
    /**
     * Fecha y hora en que esta contraseña fue utilizada.
     */
    private LocalDateTime usedAt;
}
