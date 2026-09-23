package com.agromarket.application.usecases.messaging;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.domain.exceptions.messaging.MessageNotAllowedException;
import com.agromarket.domain.exceptions.messaging.NotificationNotFoundException;
import com.agromarket.domain.exceptions.messaging.TicketNotFoundException;
import com.agromarket.domain.models.enums.messaging.TicketStatus;
import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.models.messaging.Message;
import com.agromarket.domain.models.messaging.Notification;
import com.agromarket.domain.models.messaging.Ticket;
import com.agromarket.domain.models.messaging.TicketMessage;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.in.messaging.MessagingPort;
import com.agromarket.domain.ports.out.user.UserPort;
import com.agromarket.domain.services.messaging.MessagingService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessagingUseCase implements MessagingPort {

    private final com.agromarket.domain.ports.out.messaging.MessagingPort messagingPersistencePort;
    private final UserPort userPort;
    private final MessagingService messagingService;

    @Override
    @Transactional
    public Message sendMessage(Long senderId, Long receiverId, String content) {
        User sender = findUser(senderId);
        User receiver = findUser(receiverId);

        /*
         * Reglas de comunicación de Asafrut:
         * - Comprador ↔ Productor: libre.
         * - Administración → Comprador/Productor: la administración inicia.
         * - Comprador/Productor → Administración: solo si la administración
         *   ya inició la conversación; de lo contrario debe usar un ticket.
         */
        boolean adminInitiated = MessagingService.isAdmin(receiver.getRole())
                && adminInitiatedConversation(receiver.getId(), sender.getId());

        messagingService.validateCommunication(
                sender.getRole(), receiver.getRole(), adminInitiated);

        Message message = Message.builder()
                .sender(sender)
                .recipient(receiver)
                .content(content)
                .build();

        messagingService.validateMessage(message);
        messagingService.initializeMessage(message);

        return messagingPersistencePort.saveMessage(message);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Message> getConversation(Long userA, Long userB) {
        findUser(userA);
        findUser(userB);
        return messagingPersistencePort.findConversation(userA, userB)
                .stream()
                .sorted(Comparator.comparing(
                        Message::getSentAt,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    @Override
    @Transactional
    public Notification createNotification(Notification notification) {
        if (notification == null || notification.getRecipient() == null
                || notification.getRecipient().getId() == null) {
            throw new IllegalArgumentException(
                    "El destinatario de la notificación es obligatorio");
        }

        User recipient = findUser(notification.getRecipient().getId());
        notification.setRecipient(recipient);
        messagingService.validateNotification(notification);

        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(LocalDateTime.now());
        }

        return messagingPersistencePort.saveNotification(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getNotifications(Long userId) {
        findUser(userId);
        return messagingPersistencePort.findNotificationsByUserId(userId);
    }

    @Override
    @Transactional
    public Notification markAsRead(String notificationId) {
        Notification notification = messagingPersistencePort
                .findNotificationById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException(
                        "No existe la notificación con id " + notificationId));

        notification.markAsRead();
        return messagingPersistencePort.saveNotification(notification);
    }

    // ==================== TICKETS DE SOPORTE ====================

    @Override
    @Transactional
    public Ticket createTicket(Ticket ticket) {
        if (ticket == null || ticket.getCreatorId() == null) {
            throw new IllegalArgumentException(
                    "El creador del ticket es obligatorio");
        }

        User creator = findUser(ticket.getCreatorId());
        ticket.setCreatorId(creator.getId());
        ticket.setCreatorName(fullName(creator));
        ticket.setCreatorRole(creator.getRole());

        messagingService.validateTicket(ticket);
        messagingService.initializeTicket(ticket);

        return messagingPersistencePort.saveTicket(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Ticket> getTickets(Long userId, Role role) {
        User user = findUser(userId);
        Role effectiveRole = role != null ? role : user.getRole();

        if (MessagingService.isAdmin(effectiveRole)) {
            return messagingPersistencePort.findAllTickets();
        }

        return messagingPersistencePort.findTicketsByCreatorId(user.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public Ticket getTicket(String ticketId, Long userId, Role role) {
        Ticket ticket = findTicket(ticketId);
        User user = findUser(userId);
        Role effectiveRole = role != null ? role : user.getRole();

        if (!messagingService.canAccessTicket(
                ticket, user.getId(), effectiveRole)) {
            throw new MessageNotAllowedException(
                    "No tienes permiso para ver este ticket de soporte.");
        }

        return ticket;
    }

    @Override
    @Transactional
    public Ticket addTicketMessage(
            String ticketId,
            Long authorId,
            Role authorRole,
            String content) {

        Ticket ticket = findTicket(ticketId);
        User author = findUser(authorId);
        Role effectiveRole = authorRole != null ? authorRole : author.getRole();

        if (!messagingService.canAccessTicket(
                ticket, author.getId(), effectiveRole)) {
            throw new MessageNotAllowedException(
                    "No tienes permiso para responder este ticket de soporte.");
        }

        TicketMessage message = TicketMessage.builder()
                .id(UUID.randomUUID().toString())
                .authorId(author.getId())
                .authorName(fullName(author))
                .authorRole(effectiveRole)
                .content(content)
                .sentAt(LocalDateTime.now())
                .build();

        messagingService.validateTicketMessage(ticket, message);

        ticket.addMessage(message);

        /*
         * Cuando la administración responde, el ticket pasa a "en proceso"
         * (si seguía abierto) para que el usuario vea que ya está atendido.
         */
        if (MessagingService.isAdmin(effectiveRole)
                && ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }

        return messagingPersistencePort.saveTicket(ticket);
    }

    /**
     * ¿La administración ya escribió antes a este usuario? Se usa para
     * permitir la respuesta del usuario dentro de una conversación que la
     * administración inició (regla de comunicación).
     */
    private boolean adminInitiatedConversation(Long adminId, Long userId) {
        if (adminId == null || userId == null) {
            return false;
        }

        return messagingPersistencePort.findConversation(adminId, userId)
                .stream()
                .anyMatch(message -> message.getSender() != null
                        && adminId.equals(message.getSender().getId()));
    }

    private Ticket findTicket(String ticketId) {
        if (ticketId == null || ticketId.isBlank()) {
            throw new IllegalArgumentException(
                    "El identificador del ticket es obligatorio");
        }

        return messagingPersistencePort.findTicketById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(
                        "No existe el ticket con id " + ticketId));
    }

    private String fullName(User user) {
        if (user == null) {
            return "Usuario";
        }
        String nombre = ((user.getFirstName() == null
                ? ""
                : user.getFirstName()) + " "
                + (user.getLastName() == null
                        ? ""
                        : user.getLastName()))
                .trim();
        return nombre.isBlank() ? "Usuario" : nombre;
    }

    private User findUser(Long userId) {
        return userPort.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe el usuario con id " + userId));
    }
}
