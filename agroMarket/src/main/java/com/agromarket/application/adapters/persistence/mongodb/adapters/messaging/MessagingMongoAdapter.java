package com.agromarket.application.adapters.persistence.mongodb.adapters.messaging;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

import com.agromarket.application.adapters.persistence.mongodb.documents.messaging.MessageDocument;
import com.agromarket.application.adapters.persistence.mongodb.documents.messaging.NotificationDocument;
import com.agromarket.application.adapters.persistence.mongodb.documents.messaging.TicketDocument;
import com.agromarket.application.adapters.persistence.mongodb.repositories.messaging.MessageMongoRepository;
import com.agromarket.application.adapters.persistence.mongodb.repositories.messaging.NotificationMongoRepository;
import com.agromarket.application.adapters.persistence.mongodb.repositories.messaging.TicketMongoRepository;
import com.agromarket.domain.models.messaging.Message;
import com.agromarket.domain.models.messaging.Notification;
import com.agromarket.domain.models.messaging.Ticket;
import com.agromarket.domain.ports.out.messaging.MessagingPort;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MessagingMongoAdapter implements MessagingPort {

    private final MessageMongoRepository messageRepository;
    private final NotificationMongoRepository notificationRepository;
    private final TicketMongoRepository ticketRepository;

    @Override
    public Message saveMessage(Message message) {
        return messageRepository.save(MessageDocument.fromDomain(message)).toDomain();
    }

    @Override
    public List<Message> findConversation(Long userA, Long userB) {
        return messageRepository.findConversation(userA, userB)
                .stream().map(entity -> entity.toDomain()).toList();
    }

    @Override
    public Notification saveNotification(Notification notification) {
        return notificationRepository.save(
                NotificationDocument.fromDomain(notification)).toDomain();
    }

    @Override
    public Optional<Notification> findNotificationById(String notificationId) {
        return notificationRepository.findById(notificationId)
                .map(entity -> entity.toDomain());
    }

    @Override
    public List<Notification> findNotificationsByUserId(Long userId) {
        return notificationRepository.findByRecipientId(userId)
                .stream().map(entity -> entity.toDomain()).toList();
    }

    // ==================== TICKETS DE SOPORTE ====================

    @Override
    public Ticket saveTicket(Ticket ticket) {
        return ticketRepository.save(TicketDocument.fromDomain(ticket))
                .toDomain();
    }

    @Override
    public Optional<Ticket> findTicketById(String ticketId) {
        return ticketRepository.findById(ticketId)
                .map(entity -> entity.toDomain());
    }

    @Override
    public List<Ticket> findTicketsByCreatorId(Long creatorId) {
        return ticketRepository.findByCreatorIdOrderByUpdatedAtDesc(creatorId)
                .stream().map(entity -> entity.toDomain()).toList();
    }

    @Override
    public List<Ticket> findAllTickets() {
        return ticketRepository.findAllByOrderByUpdatedAtDesc()
                .stream().map(entity -> entity.toDomain()).toList();
    }
}
