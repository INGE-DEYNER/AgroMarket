package com.agromarket.application.adapters.persistence.mongodb.documents.messaging;

import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import com.agromarket.domain.models.messaging.Message;
import com.agromarket.domain.models.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "messages")
@CompoundIndex(name = "idx_message_conversation", def = "{'senderId': 1, 'recipientId': 1}")
public class MessageDocument {
    @Id
    private String id;
    private Long senderId;
    private String senderName;
    private Long recipientId;
    private String recipientName;
    private String content;
    private boolean read;
    private LocalDateTime sentAt;

    public Message toDomain() {
        return Message.builder()
                .id(parseId(id))
                .sender(User.builder().id(senderId).build())
                .recipient(User.builder().id(recipientId).build())
                .content(content).read(read).sentAt(sentAt).build();
    }

    public static MessageDocument fromDomain(Message message) {
        Long senderId = message.getSender() != null ? message.getSender().getId() : null;
        Long recipientId = message.getRecipient() != null ? message.getRecipient().getId() : null;
        String senderName = message.getSender() != null
                ? buildName(message.getSender().getFirstName(), message.getSender().getLastName())
                : null;
        String recipientName = message.getRecipient() != null
                ? buildName(message.getRecipient().getFirstName(), message.getRecipient().getLastName())
                : null;

        return MessageDocument.builder()
                .id(message.getId() != null ? message.getId().toString() : null)
                .senderId(senderId).senderName(senderName)
                .recipientId(recipientId).recipientName(recipientName)
                .content(message.getContent()).read(message.isRead())
                .sentAt(message.getSentAt()).build();
    }

    private static String buildName(String first, String last) {
        String f = first == null ? "" : first.trim();
        String l = last == null ? "" : last.trim();
        return (f + " " + l).trim();
    }

    private static Long parseId(String value) {
        if (value == null || value.isBlank())
            return null;
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
