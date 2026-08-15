package com.agromarket.domain.models.messaging;

import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.messaging.NotificationType;
import com.agromarket.domain.models.user.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad de dominio que representa una notificación del sistema.
 * Las notificaciones son enviadas por el sistema a los usuarios para informarles
 * sobre eventos importantes como actualizaciones de pedidos, pagos, mensajes, etc.
 * 
 * @author AgroMarket Team
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    
    private Long id;
    
    /**
     * Usuario destinatario de la notificación.
     */
    private User recipient;
    
    /**
     * Tipo de notificación.
     */
    private NotificationType type;
    
    /**
     * Contenido o mensaje de la notificación.
     */
    private String content;
    
    /**
     * Indica si la notificación ha sido leída por el destinatario.
     */
    @Builder.Default
    private boolean read = false;
    
    /**
     * Fecha y hora en que se creó la notificación.
     */
    private LocalDateTime createdAt;
    
    
    // ==================== MÉTODOS DE NEGOCIO ====================
    
    /**
     * Marca la notificación como leída.
     */
    public void markAsRead() {
        this.read = true;
    }
}
