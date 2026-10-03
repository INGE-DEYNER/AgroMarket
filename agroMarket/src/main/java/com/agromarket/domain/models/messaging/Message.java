package com.agromarket.domain.models.messaging;

import java.time.LocalDateTime;

import com.agromarket.domain.models.user.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad de dominio que representa un mensaje entre usuarios en el sistema.
 * Permite la comunicación directa entre compradores y productores.
 * 
 * @author AgroMarket Team
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    
    private Long id;
    
    /**
     * Usuario que envió el mensaje.
     */
    private User sender;
    
    /**
     * Usuario que recibe el mensaje.
     */
    private User recipient;
    
    /**
     * Contenido del mensaje.
     */
    private String content;
    
    /**
     * Indica si el mensaje ha sido leído por el destinatario.
     */
    @Builder.Default
    private boolean read = false;
    
    /**
     * Fecha y hora en que se envió el mensaje.
     */
    private LocalDateTime sentAt;
    
    
    // ==================== MÉTODOS DE NEGOCIO ====================
    
    /**
     * Marca el mensaje como leído.
     */
    public void markAsRead() {
        this.read = true;
    }
}
