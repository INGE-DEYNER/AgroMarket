package com.agromarket.domain.messaging.enums;

/**
 * Enumeración que representa los tipos de notificaciones en el sistema.
 * Se utiliza para categorizar las notificaciones enviadas a los usuarios.
 * 
 * @author AgroMarket Team
 */
public enum NotificationType {
    /**
     * Notificación de un nuevo pedido recibido.
     */
    NEW_ORDER,
    
    /**
     * Notificación de actualización en el estado de un pedido.
     */
    ORDER_UPDATED,
    
    /**
     * Notificación de confirmación de pago.
     */
    PAYMENT_CONFIRMED,
    
    /**
     * Notificación de un nuevo mensaje recibido.
     */
    NEW_MESSAGE,
    
    /**
     * Notificación de stock bajo en un producto.
     */
    LOW_STOCK
}
