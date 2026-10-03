package com.agromarket.domain.services.messaging;


import java.time.LocalDateTime;

import com.agromarket.domain.exceptions.messaging.MessageNotAllowedException;
import com.agromarket.domain.models.enums.messaging.TicketStatus;
import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.models.messaging.Message;
import com.agromarket.domain.models.messaging.Notification;
import com.agromarket.domain.models.messaging.Ticket;
import com.agromarket.domain.models.messaging.TicketMessage;

/**
 * Servicio de dominio para reglas de mensajería.
 *
 * <p>
 * Reglas de comunicación de Asafrut (canal chat):
 * </p>
 *
 * <ul>
 * <li>Comprador ↔ Productor: conversación directa en ambos sentidos.</li>
 * <li>Administración → Comprador/Productor: la administración puede iniciar
 * la conversación, y el usuario puede responder dentro de ella.</li>
 * <li>Comprador/Productor → Administración: NO puede iniciar conversación
 * por el chat; debe usar los tickets de soporte.</li>
 * </ul>
 *
 * @author Asafrut Team
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

    // ==================== REGLAS DE COMUNICACIÓN POR ROL ====================

    /** ¿El rol corresponde a un comprador? */
    public static boolean isBuyer(Role role) {
        return role == Role.BUYER;
    }

    /** ¿El rol corresponde a un productor? */
    public static boolean isProducer(Role role) {
        return role == Role.PRODUCER;
    }

    /** ¿El rol corresponde a la administración? */
    public static boolean isAdmin(Role role) {
        return role == Role.ADMIN;
    }

    /**
     * Regla estricta: ¿el usuario {@code senderRole} puede INICIAR una
     * conversación con {@code receiverRole}?
     *
     * @return true solo para Comprador ↔ Productor y para
     *         Administración → Comprador/Productor
     */
    public boolean canStartConversation(Role senderRole, Role receiverRole) {

        if (senderRole == null || receiverRole == null) {
            return false;
        }

        // Nadie se escribe a sí mismo ni a alguien de su mismo rol
        // (esto bloquea también Administración → Administración).
        if (senderRole == receiverRole) {
            return false;
        }

        // Administración → Comprador/Productor.
        if (isAdmin(senderRole)
                && (isBuyer(receiverRole) || isProducer(receiverRole))) {
            return true;
        }

        // Comprador/Productor → Administración: solo por tickets.
        if (isAdmin(receiverRole)) {
            return false;
        }

        // Comprador ↔ Productor.
        return (isBuyer(senderRole) && isProducer(receiverRole))
                || (isProducer(senderRole) && isBuyer(receiverRole));
    }

    /**
     * Regla completa, incluyendo la respuesta del usuario dentro de una
     * conversación que la administración ya inició.
     *
     * @param adminInitiated true cuando ya existe una conversación en la que
     *                       la administración escribió primero al usuario
     */
    public boolean canCommunicate(
            Role senderRole,
            Role receiverRole,
            boolean adminInitiated) {

        if (canStartConversation(senderRole, receiverRole)) {
            return true;
        }

        return adminInitiated
                && isAdmin(receiverRole)
                && (isBuyer(senderRole) || isProducer(senderRole));
    }

    /**
     * Valida las reglas de comunicación entre dos usuarios y lanza una
     * excepción de dominio legible cuando no se permite.
     */
    public void validateCommunication(
            Role senderRole,
            Role receiverRole,
            boolean adminInitiated) {

        if (canCommunicate(senderRole, receiverRole, adminInitiated)) {
            return;
        }

        if (isAdmin(receiverRole)
                && (isBuyer(senderRole) || isProducer(senderRole))) {
            throw new MessageNotAllowedException(
                    "Para comunicarte con la administración debes crear un "
                            + "ticket de soporte.");
        }

        if (senderRole == receiverRole) {
            throw new MessageNotAllowedException(
                    "No puedes enviar mensajes a usuarios con tu mismo rol.");
        }

        throw new MessageNotAllowedException(
                "No puedes enviar mensajes a este usuario: la mensajería "
                        + "directa solo está permitida entre compradores y "
                        + "productores.");
    }

    // ==================== TICKETS DE SOPORTE ====================

    /**
     * Valida los datos obligatorios de un ticket nuevo.
     */
    public void validateTicket(Ticket ticket) {

        if (ticket == null) {
            throw new IllegalArgumentException("El ticket es obligatorio");
        }

        if (ticket.getCreatorId() == null) {
            throw new IllegalArgumentException(
                    "El creador del ticket es obligatorio");
        }

        if (ticket.getCreatorRole() == null) {
            throw new IllegalArgumentException(
                    "El rol del creador del ticket es obligatorio");
        }

        if (!isBuyer(ticket.getCreatorRole())
                && !isProducer(ticket.getCreatorRole())) {
            throw new MessageNotAllowedException(
                    "Solo compradores y productores pueden crear tickets de "
                            + "soporte.");
        }

        if (ticket.getSubject() == null || ticket.getSubject().isBlank()) {
            throw new IllegalArgumentException(
                    "El asunto del ticket es obligatorio");
        }

        if (ticket.getSubject().length() > 150) {
            throw new IllegalArgumentException(
                    "El asunto del ticket no puede superar los 150 caracteres");
        }

        if (ticket.getDescription() == null
                || ticket.getDescription().isBlank()) {
            throw new IllegalArgumentException(
                    "La descripción del ticket es obligatoria");
        }

        if (ticket.getDescription().length() > 5000) {
            throw new IllegalArgumentException(
                    "La descripción del ticket no puede superar los 5000 "
                            + "caracteres");
        }
    }

    /**
     * Completa fechas y estado por defecto de un ticket nuevo.
     */
    public void initializeTicket(Ticket ticket) {

        LocalDateTime now = LocalDateTime.now();

        if (ticket.getCreatedAt() == null) {
            ticket.setCreatedAt(now);
        }

        if (ticket.getUpdatedAt() == null) {
            ticket.setUpdatedAt(now);
        }

        if (ticket.getStatus() == null) {
            ticket.setStatus(TicketStatus.OPEN);
        }
    }

    /**
     * Valida una respuesta dentro de un ticket.
     */
    public void validateTicketMessage(Ticket ticket, TicketMessage message) {

        if (ticket == null) {
            throw new IllegalArgumentException("El ticket es obligatorio");
        }

        if (message == null) {
            throw new IllegalArgumentException(
                    "El mensaje del ticket es obligatorio");
        }

        if (message.getAuthorId() == null) {
            throw new IllegalArgumentException(
                    "El autor del mensaje es obligatorio");
        }

        if (message.getContent() == null || message.getContent().isBlank()) {
            throw new IllegalArgumentException(
                    "El contenido del mensaje es obligatorio");
        }

        if (message.getContent().length() > 5000) {
            throw new IllegalArgumentException(
                    "El mensaje no puede superar los 5000 caracteres");
        }
    }

    /**
     * ¿El usuario puede ver y responder este ticket?
     * Solo el creador y la administración.
     */
    public boolean canAccessTicket(Ticket ticket, Long userId, Role role) {

        if (ticket == null || userId == null || role == null) {
            return false;
        }

        if (isAdmin(role)) {
            return true;
        }

        return userId.equals(ticket.getCreatorId());
    }
}