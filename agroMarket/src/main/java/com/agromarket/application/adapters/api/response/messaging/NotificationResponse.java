package com.agromarket.application.adapters.api.response.messaging;

import java.time.LocalDateTime;
import com.agromarket.domain.models.enums.messaging.NotificationType;
import com.agromarket.domain.models.messaging.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private String id;
    private Long recipientId;
    private NotificationType type;
    private String content;
    private boolean read;
    private LocalDateTime createdAt;

    public static NotificationResponse fromDomain(Notification notification) {
        if (notification == null)
            return null;
        Long recipientId = notification.getRecipient() != null
                ? notification.getRecipient().getId()
                : null;
        return NotificationResponse.builder()
                .id(notification.getId()).recipientId(recipientId)
                .type(notification.getType()).content(notification.getContent())
                .read(notification.isRead()).createdAt(notification.getCreatedAt()).build();
    }
}
