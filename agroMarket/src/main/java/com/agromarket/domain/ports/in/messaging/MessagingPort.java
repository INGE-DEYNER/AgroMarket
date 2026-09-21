
package com.agromarket.domain.ports.in.messaging;

import java.util.List;

import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.models.messaging.Message;
import com.agromarket.domain.models.messaging.Notification;
import com.agromarket.domain.models.messaging.Ticket;

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
    Notification markAsRead(String notificationId);

    // ==================== TICKETS DE SOPORTE ====================

    /**
     * Crea un ticket de soporte. Solo compradores y productores.
     */
    Ticket createTicket(Ticket ticket);

    /**
     * Tickets visibles para el usuario: los propios, o todos si es ADMIN.
     */
    List<Ticket> getTickets(Long userId, Role role);

    /**
     * Detalle de un ticket (solo creador o administración).
     */
    Ticket getTicket(String ticketId, Long userId, Role role);

    /**
     * Agrega una respuesta al ticket (solo creador o administración).
     */
    Ticket addTicketMessage(
            String ticketId,
            Long authorId,
            Role authorRole,
            String content
    );
}