package com.agromarket.application.adapters.persistence.mongodb.documents.messaging;

import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.models.messaging.TicketMessage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Representación persistente de una respuesta dentro de un ticket.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketMessageDocument {

    private String id;
    private Long authorId;
    private String authorName;
    private Role authorRole;
    private String content;
    private LocalDateTime sentAt;

    public TicketMessage toDomain() {
        return TicketMessage.builder()
                .id(id)
                .authorId(authorId)
                .authorName(authorName)
                .authorRole(authorRole)
                .content(content)
                .sentAt(sentAt)
                .build();
    }

    public static TicketMessageDocument fromDomain(TicketMessage message) {
        if (message == null) {
            return null;
        }
        return TicketMessageDocument.builder()
                .id(message.getId())
                .authorId(message.getAuthorId())
                .authorName(message.getAuthorName())
                .authorRole(message.getAuthorRole())
                .content(message.getContent())
                .sentAt(message.getSentAt())
                .build();
    }
}
