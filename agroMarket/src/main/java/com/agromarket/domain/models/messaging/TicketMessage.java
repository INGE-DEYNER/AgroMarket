package com.agromarket.domain.models.messaging;

import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.user.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Respuesta dentro de un ticket de soporte.
 *
 * @author Asafrut Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketMessage {

    private String id;

    private Long authorId;

    private String authorName;

    private Role authorRole;

    private String content;

    private LocalDateTime sentAt;
}
