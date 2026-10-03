package com.agromarket.domain.models.enums.messaging;

/**
 * Estados posibles de un ticket de soporte.
 *
 * <p>
 * El ticket es el canal oficial para que un comprador o productor se
 * comunique con la administración de Asafrut sin romper la regla de
 * comunicación entre roles.
 * </p>
 */
public enum TicketStatus {
    /** El ticket fue creado y aún no lo atiende la administración. */
    OPEN,
    /** La administración ya está atendiendo el ticket. */
    IN_PROGRESS,
    /** El caso fue resuelto. */
    CLOSED
}
