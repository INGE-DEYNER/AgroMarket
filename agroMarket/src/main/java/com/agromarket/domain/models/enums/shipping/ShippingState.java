package com.agromarket.domain.shipping.enums;

/**
 * Enumeración que representa los posibles estados de un envío en el sistema.
 * Define el ciclo de vida de la logística de entrega de un producto.
 * 
 * @author AgroMarket Team
 */
public enum ShippingState {
    /**
     * El pedido ha sido confirmado y está listo para preparación.
     */
    ORDER_CONFIRMED,
    
    /**
     * El producto está siendo preparado para el envío.
     */
    PREPARING,
    
    /**
     * El producto está en tránsito hacia el destino.
     */
    IN_TRANSIT,
    
    /**
     * El producto está en la fase final de reparto.
     */
    IN_DELIVERY,
    
    /**
     * El producto ha sido entregado al comprador.
     */
    DELIVERED
}
