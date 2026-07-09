package com.agromarket.domain.ports;

import java.util.List;

import com.agromarket.domain.models.Mensaje;

public interface MensajeRepository {
    List<Mensaje> findConversacion(Long userId1, Long userId2);

    List<Mensaje> findContactos(Long userId);

    long countNoLeidos(Long destinatarioId);

    Mensaje save(Mensaje mensaje);
}
