package com.agromarket.domain.models.messaging;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.agromarket.domain.models.enums.messaging.TicketStatus;
import com.agromarket.domain.models.enums.user.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Ticket de soporte creado por un comprador o productor.
 *
 * <p>
 * Implementa la regla de comunicación «Comprador/Productor → Administración
 * solo a través de tickets»: el creador y la administración son los únicos
 * participantes del ticket.
 * </p>
 *
 * @author Asafrut Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    private String id;

    private Long creatorId;

    private String creatorName;

    /** Rol del creador: siempre BUYER o PRODUCER. */
    private Role creatorRole;

    private String subject;

    private String description;

    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Builder.Default
    private List<TicketMessage> messages = new ArrayList<>();

    // ==================== MÉTODOS DE NEGOCIO ====================

    /**
     * Agrega una respuesta al ticket y actualiza su fecha de modificación.
     */
    public void addMessage(TicketMessage message) {
        if (messages == null) {
            messages = new ArrayList<>();
        }
        messages.add(message);
        this.updatedAt = message != null ? message.getSentAt() : LocalDateTime.now();
    }
}
