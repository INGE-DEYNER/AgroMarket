package com.agromarket.application.adapters.persistence.mongodb.adapters.messaging;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

import com.agromarket.application.adapters.persistence.mongodb.documents.messaging.MessageDocument;
import com.agromarket.application.adapters.persistence.mongodb.documents.messaging.NotificationDocument;
import com.agromarket.application.adapters.persistence.mongodb.repositories.messaging.MessageMongoRepository;
import com.agromarket.application.adapters.persistence.mongodb.repositories.messaging.NotificationMongoRepository;
import com.agromarket.domain.models.messaging.Message;
import com.agromarket.domain.models.messaging.Notification;
import com.agromarket.domain.ports.out.messaging.MessagingPort;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MessagingMongoAdapter implements MessagingPort {

    private final MessageMongoRepository messageRepository;
    private final NotificationMongoRepository notificationRepository;

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
    public Optional<Notification> findNotificationById(Long notificationId) {
        return notificationRepository.findById(notificationId.toString())
                .map(entity -> entity.toDomain());
    }

    @Override
    public List<Notification> findNotificationsByUserId(Long userId) {
        return notificationRepository.findByRecipientId(userId)
                .stream().map(entity -> entity.toDomain()).toList();
    }
}
