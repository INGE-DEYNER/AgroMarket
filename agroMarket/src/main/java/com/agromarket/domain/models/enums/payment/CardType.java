package com.agromarket.domain.payment.enums;

/**
 * Enumeración que representa los tipos de tarjetas de pago aceptadas.
 * Se utiliza para identificar la marca de la tarjeta en transacciones.
 * 
 * @author AgroMarket Team
 */
public enum CardType {
    /**
     * Tarjeta Visa.
     */
    VISA,
    
    /**
     * Tarjeta Mastercard.
     */
    MASTERCARD,
    
    /**
     * Tarjeta American Express.
     */
    AMEX,
    
    /**
     * Tarjeta Diners Club.
     */
    DINERS,
    
    /**
     * Tarjeta Discover.
     */
    DISCOVER,
    
    /**
     * Tipo de tarjeta no especificado o personalizado.
     */
    OTHER
}
