package com.agromarket.domain.exceptions.messaging;

import com.agromarket.domain.exceptions.DomainException;

/**
 * Se lanza cuando un usuario intenta comunicarse con otro incumpliendo las
 * reglas de mensajería de Asafrut:
 *
 * <ul>
 * <li>Comprador ↔ Productor: comunicación directa permitida.</li>
 * <li>Administración → Comprador/Productor: permitida (el admin inicia).</li>
 * <li>Comprador/Productor → Administración: solo a través de un ticket de
 * soporte, o como respuesta a una conversación que la administración ya
 * inició.</li>
 * </ul>
 *
 * @author Asafrut Team
 */
public class MessageNotAllowedException extends DomainException {

    public MessageNotAllowedException(String message) {
        super(message);
    }
}
