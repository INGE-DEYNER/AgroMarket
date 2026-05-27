package com.agromarket.domain.repository;

import java.util.List;

import com.agromarket.domain.model.Mensaje;

public interface MensajeRepository {
    List<Mensaje> findConversacion(Long userId1, Long userId2);

    List<Mensaje> findContactos(Long userId);

    long countNoLeidos(Long destinatarioId);

    Mensaje save(Mensaje mensaje);
}
