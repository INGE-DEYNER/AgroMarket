package com.agromarket.application.adapters.api.response.messaging;

import java.time.LocalDateTime;

import com.agromarket.domain.models.messaging.TicketMessage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Respuesta dentro de un ticket de soporte expuesta al frontend.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketMessageResponse {

    private String id;
    private Long senderId;
    private String senderUsername;
    private String senderRole;
    private String content;
    private LocalDateTime timestamp;

    public static TicketMessageResponse fromDomain(TicketMessage message) {
        if (message == null) {
            return null;
        }

        return TicketMessageResponse.builder()
                .id(message.getId())
                .senderId(message.getAuthorId())
                .senderUsername(message.getAuthorName())
                .senderRole(message.getAuthorRole() == null
                        ? null
                        : message.getAuthorRole().name())
                .content(message.getContent())
                .timestamp(message.getSentAt())
                .build();
    }
}
