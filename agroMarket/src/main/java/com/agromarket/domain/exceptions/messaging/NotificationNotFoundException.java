package com.agromarket.domain.exceptions.messaging;
import com.agromarket.domain.exceptions.DomainException;
/**
 * Excepción lanzada cuando una notificación no se encuentra.
 */
public class NotificationNotFoundException extends DomainException {

    public NotificationNotFoundException(String message) {
        super(message);
    }
}