package com.agromarket.application.adapters.persistence.mongodb.documents.messaging;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.agromarket.domain.models.enums.messaging.TicketStatus;
import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.models.messaging.Ticket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Documento MongoDB de los tickets de soporte.
 *
 * <p>
 * Los tickets son el canal por el que compradores y productores se
 * comunican con la administración (regla de comunicación de Asafrut).
 * </p>
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class TicketDocument {

    @Id
    private String id;

    @Indexed
    private Long creatorId;

    private String creatorName;

    private Role creatorRole;

    private String subject;

    private String description;

    private TicketStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Builder.Default
    private List<TicketMessageDocument> messages = new ArrayList<>();

    public Ticket toDomain() {
        List<TicketMessageDocument> safeMessages = messages == null
                ? List.of()
                : messages;

        return Ticket.builder()
                .id(id)
                .creatorId(creatorId)
                .creatorName(creatorName)
                .creatorRole(creatorRole)
                .subject(subject)
                .description(description)
                .status(status == null ? TicketStatus.OPEN : status)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .messages(safeMessages.stream()
                        .map(TicketMessageDocument::toDomain)
                        .toList())
                .build();
    }

    public static TicketDocument fromDomain(Ticket ticket) {
        List<TicketMessageDocument> mapped = ticket.getMessages() == null
                ? new ArrayList<>()
                : ticket.getMessages().stream()
                        .map(TicketMessageDocument::fromDomain)
                        .toList();

        return TicketDocument.builder()
                .id(ticket.getId())
                .creatorId(ticket.getCreatorId())
                .creatorName(ticket.getCreatorName())
                .creatorRole(ticket.getCreatorRole())
                .subject(ticket.getSubject())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .messages(new ArrayList<>(mapped))
                .build();
    }
}
