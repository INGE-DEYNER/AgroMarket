package com.agromarket.domain.models.enums.payment;

/**
 * Ciclo de vida de una tarjeta tokenizada guardada por un usuario.
 *
 * <p>
 * Nunca representa datos de tarjeta: solo el estado administrativo del
 * token almacenado.
 * </p>
 *
 * @author AgroMarket Team
 */
public enum CardStatus {

    /** La tarjeta tokenizada está activa y puede usarse en checkout. */
    ACTIVE,

    /** La tarjeta fue eliminada por el usuario (borrado lógico). */
    INACTIVE,

    /**
     * El proveedor invalidó el token (tarjeta vencida, revocada o
     * inconsistente). Requiere volver a tokenizar.
     */
    INVALID
}