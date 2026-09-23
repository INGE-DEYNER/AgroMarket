package com.agromarket.application.adapters.api.response.messaging;

import java.time.LocalDateTime;
import java.util.List;

import com.agromarket.domain.models.messaging.Ticket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Ticket de soporte expuesto al frontend.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {

    private String id;
    private Long creatorId;
    private String creatorUsername;
    private String creatorRole;
    private String subject;
    private String description;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TicketMessageResponse> messages;

    public static TicketResponse fromDomain(Ticket ticket) {
        if (ticket == null) {
            return null;
        }

        List<TicketMessageResponse> mensajes = ticket.getMessages() == null
                ? List.of()
                : ticket.getMessages().stream()
                        .map(TicketMessageResponse::fromDomain)
                        .toList();

        return TicketResponse.builder()
                .id(ticket.getId())
                .creatorId(ticket.getCreatorId())
                .creatorUsername(ticket.getCreatorName())
                .creatorRole(ticket.getCreatorRole() == null
                        ? null
                        : ticket.getCreatorRole().name())
                .subject(ticket.getSubject())
                .description(ticket.getDescription())
                .status(ticket.getStatus() == null
                        ? null
                        : ticket.getStatus().name())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .messages(mensajes)
                .build();
    }
}
