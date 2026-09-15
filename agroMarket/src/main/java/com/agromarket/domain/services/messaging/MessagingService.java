package com.agromarket.domain.services.messaging;


import java.time.LocalDateTime;

import com.agromarket.domain.models.messaging.Message;
import com.agromarket.domain.models.messaging.Notification;

/**
 * Servicio de dominio para reglas de mensajería.
 */
public class MessagingService {

    /**
     * Valida los datos necesarios para enviar un mensaje.
     */
    public void validateMessage(Message message) {

        if (message == null) {
            throw new IllegalArgumentException(
                    "El mensaje es obligatorio"
            );
        }

        if (message.getSender() == null
                || message.getRecipient() == null) {

            throw new IllegalArgumentException(
                    "El remitente y destinatario son obligatorios"
            );
        }

        if (message.getSender().getId()
                .equals(message.getRecipient().getId())) {

            throw new IllegalArgumentException(
                    "Un usuario no puede enviarse mensajes a sí mismo"
            );
        }

        if (message.getContent() == null
                || message.getContent().isBlank()) {

            throw new IllegalArgumentException(
                    "El contenido del mensaje es obligatorio"
            );
        }

        if (message.getContent().length() > 5000) {

            throw new IllegalArgumentException(
                    "El mensaje no puede superar los 5000 caracteres"
            );
        }
    }

    /**
     * Completa la fecha de envío cuando sea necesario.
     */
    public void initializeMessage(Message message) {

        if (message.getSentAt() == null) {
            message.setSentAt(LocalDateTime.now());
        }
    }

    /**
     * Valida una notificación.
     */
    public void validateNotification(Notification notification) {

        if (notification == null) {
            throw new IllegalArgumentException(
                    "La notificación es obligatoria"
            );
        }

        if (notification.getRecipient() == null) {
            throw new IllegalArgumentException(
                    "El destinatario de la notificación es obligatorio"
            );
        }

        if (notification.getType() == null) {
            throw new IllegalArgumentException(
                    "El tipo de notificación es obligatorio"
            );
        }

        if (notification.getContent() == null
                || notification.getContent().isBlank()) {

            throw new IllegalArgumentException(
                    "El contenido de la notificación es obligatorio"
            );
        }
    }
}