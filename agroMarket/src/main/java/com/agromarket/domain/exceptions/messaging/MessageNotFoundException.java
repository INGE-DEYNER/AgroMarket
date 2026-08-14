package com.agromarket.domain.exceptions.messaging;

/**
 * Excepción lanzada cuando un mensaje no se encuentra.
 */
public class MessageNotFoundException extends RuntimeException {

    public MessageNotFoundException(String message) {
        super(message);
    }
}