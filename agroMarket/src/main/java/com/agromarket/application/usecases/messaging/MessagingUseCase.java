package com.agromarket.application.usecases.messaging;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.domain.exceptions.messaging.NotificationNotFoundException;
import com.agromarket.domain.models.messaging.Message;
import com.agromarket.domain.models.messaging.Notification;
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
        return messagingPersistencePort.findConversation(userA, userB);
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
    public Notification markAsRead(Long notificationId) {
        Notification notification = messagingPersistencePort
                .findNotificationById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException(
                        "No existe la notificación con id " + notificationId));

        notification.markAsRead();
        return messagingPersistencePort.saveNotification(notification);
    }

    private User findUser(Long userId) {
        return userPort.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe el usuario con id " + userId));
    }
}
