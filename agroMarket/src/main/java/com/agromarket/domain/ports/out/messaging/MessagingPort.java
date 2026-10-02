package com.agromarket.domain.ports.out.messaging;

import java.util.List;
import java.util.Optional;

import com.agromarket.domain.models.messaging.Message;
import com.agromarket.domain.models.messaging.Notification;
import com.agromarket.domain.models.messaging.Ticket;

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
     * Identificadores de todos los usuarios con los que este usuario tiene al
     * menos un mensaje, en ambas direcciones.
     *
     * <p>Sirve para listar conversaciones reales: el usuario solo debe ver
     * con quién se ha escrito, no el catálogo completo de usuarios del rol
     * contrario.</p>
     */
    List<Long> findConversationPartnerIds(Long userId);

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
            String notificationId
    );

    /**
     * Obtiene las notificaciones de un usuario.
     */
    List<Notification> findNotificationsByUserId(
            Long userId
    );

    // ==================== TICKETS DE SOPORTE ====================

    /**
     * Guarda (crea o actualiza) un ticket de soporte.
     */
    Ticket saveTicket(Ticket ticket);

    /**
     * Busca un ticket por su identificador.
     */
    Optional<Ticket> findTicketById(String ticketId);

    /**
     * Tickets creados por un usuario, del más reciente al más antiguo.
     */
    List<Ticket> findTicketsByCreatorId(Long creatorId);

    /**
     * Todos los tickets (uso exclusivo de la administración).
     */
    List<Ticket> findAllTickets();
}