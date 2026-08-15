package com.agromarket.domain.models.enums.order;

/**
 * Enumeración que representa los posibles estados de un pedido en el sistema.
 * Define el ciclo de vida de un pedido desde su creación hasta su finalización.
 * 
 * @author AgroMarket Team
 */
public enum OrderState {
    /**
     * El pedido ha sido creado pero aún no ha sido procesado.
     */
    PENDING,
    
    /**
     * El pedido ha sido enviado al productor o está en preparación.
     */
    SHIPPED,
    
    /**
     * El pedido ha sido entregado al comprador.
     */
    DELIVERED,
    
    /**
     * El pedido ha sido cancelado por el comprador o el sistema.
     */
    CANCELLED
}
