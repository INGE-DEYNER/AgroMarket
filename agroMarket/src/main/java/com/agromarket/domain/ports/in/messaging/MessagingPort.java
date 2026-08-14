
package com.agromarket.domain.ports.in.messaging;

import java.util.List;

import com.agromarket.domain.models.messaging.Message;
import com.agromarket.domain.models.messaging.Notification;

/**
 * Puerto de entrada para mensajería y notificaciones.
 */
public interface MessagingPort {

    /**
     * Envía un mensaje entre usuarios.
     */
    Message sendMessage(
            Long senderId,
            Long receiverId,
            String content
    );

    /**
     * Obtiene una conversación entre dos usuarios.
     */
    List<Message> getConversation(
            Long userA,
            Long userB
    );

    /**
     * Crea una notificación.
     */
    Notification createNotification(
            Notification notification
    );

    /**
     * Obtiene las notificaciones de un usuario.
     */
    List<Notification> getNotifications(Long userId);

    /**
     * Marca una notificación como leída.
     */
    Notification markAsRead(Long notificationId);
}