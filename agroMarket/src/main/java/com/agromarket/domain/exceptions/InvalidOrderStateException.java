package com.agromarket.domain.exceptions;

/**
 * Excepción lanzada cuando se intenta realizar una operación con un estado de pedido inválido.
 * Por ejemplo, intentar cancelar un pedido que ya ha sido entregado.
 * 
 * @author AgroMarket Team
 */
public class InvalidOrderStateException extends RuntimeException {
    
    /**
     * Constructor con mensaje descriptivo.
     * 
     * @param message mensaje que describe el error (ej: "No se puede cancelar un pedido en estado ENTREGADO")
     */
    public InvalidOrderStateException(String message) {
        super(message);
    }
}
