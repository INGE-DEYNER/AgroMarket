package com.agromarket.application.adapters.persistence.mongodb.documents.messaging;

import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import com.agromarket.domain.models.enums.messaging.NotificationType;
import com.agromarket.domain.models.messaging.Notification;
import com.agromarket.domain.models.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class NotificationDocument {
    @Id
    private String id;
    @Indexed
    private Long recipientId;
    private NotificationType type;
    private String content;
    private boolean read;
    private LocalDateTime createdAt;

    public Notification toDomain() {
        return Notification.builder()
                .id(id)
                .recipient(User.builder().id(recipientId).build())
                .type(type).content(content).read(read).createdAt(createdAt).build();
    }

    public static NotificationDocument fromDomain(Notification notification) {
        Long recipientId = notification.getRecipient() != null
                ? notification.getRecipient().getId()
                : null;
        return NotificationDocument.builder()
                .id(notification.getId())
                .recipientId(recipientId).type(notification.getType())
                .content(notification.getContent()).read(notification.isRead())
                .createdAt(notification.getCreatedAt()).build();
    }
}
