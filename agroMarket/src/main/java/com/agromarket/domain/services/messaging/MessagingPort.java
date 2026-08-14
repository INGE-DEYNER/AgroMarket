
package com.agromarket.domain.ports.out.messaging;

import java.util.List;
import java.util.Optional;

import com.agromarket.domain.models.messaging.Message;
import com.agromarket.domain.models.messaging.Notification;

/**
 * Puerto de salida para persistencia de mensajería.
 */
public interface MessagingPort {

    /**
     * Guarda un mensaje.
     */
    Message saveMessage(Message message);

    /**
     * Obtiene la conversación entre dos usuarios.
     */
    List<Message> findConversation(
            Long userA,
            Long userB
    );

    /**
     * Guarda una notificación.
     */
    Notification saveNotification(
            Notification notification
    );

    /**
     * Obtiene una notificación.
     */
    Optional<Notification> findNotificationById(
            Long notificationId
    );

    /**
     * Obtiene las notificaciones de un usuario.
     */
    List<Notification> findNotificationsByUserId(
            Long userId
    );
}