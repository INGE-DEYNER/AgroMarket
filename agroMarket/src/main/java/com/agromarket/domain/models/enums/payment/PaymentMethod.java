package com.agromarket.domain.models.enums.payment;
/**
 * Enumeración que representa los métodos de pago aceptados en el sistema.
 * Define las opciones disponibles para que los usuarios realicen pagos.
 * 
 * @author AgroMarket Team
 */
public enum PaymentMethod {
    /**
     * Pago con tarjeta de crédito.
     */
    CREDIT_CARD,
    
    /**
     * Pago con tarjeta de débito.
     */
    DEBIT_CARD,
    
    /**
     * Pago a través de PSE (Pagos Seguros en Línea, sistema colombiano).
     */
    PSE,
    
    /**
     * Pago en efectivo (contra reembolso o en persona).
     */
    CASH
}
