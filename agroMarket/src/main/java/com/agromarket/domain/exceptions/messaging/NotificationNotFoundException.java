package com.agromarket.domain.exceptions.messaging;

/**
 * Excepción lanzada cuando una notificación no se encuentra.
 */
public class NotificationNotFoundException extends RuntimeException {

    public NotificationNotFoundException(String message) {
        super(message);
    }
}