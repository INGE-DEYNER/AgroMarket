package com.agromarket.application.adapters.api.response.messaging;

import java.time.LocalDateTime;
import com.agromarket.domain.models.messaging.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private Long id;
    private Long senderId;
    private String senderName;
    private Long recipientId;
    private String content;
    private boolean read;
    private LocalDateTime sentAt;

    public static MessageResponse fromDomain(Message message) {
        if (message == null)
            return null;
        Long senderId = message.getSender() != null ? message.getSender().getId() : null;
        Long recipientId = message.getRecipient() != null ? message.getRecipient().getId() : null;
        String senderName = message.getSender() != null
                ? buildName(message.getSender().getFirstName(), message.getSender().getLastName())
                : null;
        return MessageResponse.builder()
                .id(message.getId()).senderId(senderId).senderName(senderName)
                .recipientId(recipientId).content(message.getContent())
                .read(message.isRead()).sentAt(message.getSentAt()).build();
    }

    private static String buildName(String first, String last) {
        String f = first == null ? "" : first.trim();
        String l = last == null ? "" : last.trim();
        return (f + " " + l).trim();
    }
}
