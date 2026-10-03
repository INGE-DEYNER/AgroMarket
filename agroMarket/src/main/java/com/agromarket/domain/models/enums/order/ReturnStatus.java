package com.agromarket.domain.models.enums.order;

/**
 * Ciclo de vida de una solicitud de devolución/reembolso.
 *
 * <p>
 * Transiciones permitidas:
 * </p>
 *
 * <pre>
 * REQUESTED    -> UNDER_REVIEW | APPROVED | REJECTED
 * UNDER_REVIEW -> APPROVED | REJECTED
 * APPROVED     -> REFUNDED
 * REFUNDED     -> COMPLETED
 * REJECTED     -> (estado final)
 * COMPLETED    -> (estado final)
 * </pre>
 *
 * @author AgroMarket Team
 */
public enum ReturnStatus {

    /** El comprador radicó la solicitud. */
    REQUESTED,

    /** Un administrador la tomó para revisión. */
    UNDER_REVIEW,

    /** Aprobada: habilita el reembolso. */
    APPROVED,

    /** Rechazada con motivo obligatorio. */
    REJECTED,

    /** El reembolso fue ejecutado contra la pasarela. */
    REFUNDED,

    /** Caso cerrado (el comprador recibió el dinero). */
    COMPLETED
}