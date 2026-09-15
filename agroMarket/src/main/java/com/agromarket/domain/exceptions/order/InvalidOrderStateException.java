package com.agromarket.domain.exceptions.order;

import com.agromarket.domain.exceptions.DomainException;
/**
 * Excepción lanzada cuando se intenta realizar una operación inválida sobre un pedido
 * debido a su estado actual. Por ejemplo, cancelar un pedido que ya ha sido entregado.
 * 
 * @author AgroMarket Team
 */
public class InvalidOrderStateException extends DomainException {
    
    /**
     * Constructor con mensaje descriptivo.
     * 
     * @param message mensaje que describe el error (ej: "No se puede cancelar un pedido entregado")
     */
    public InvalidOrderStateException(String message) {
        super(message);
    }
}
