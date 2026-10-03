package com.agromarket.domain.exceptions.messaging;
import com.agromarket.domain.exceptions.DomainException;
/**
 * Excepción lanzada cuando un mensaje no se encuentra.
 */
public class MessageNotFoundException extends DomainException {

    public MessageNotFoundException(String message) {
        super(message);
    }
}