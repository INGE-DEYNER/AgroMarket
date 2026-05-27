package com.agromarket.application.service;

import java.util.List;

import com.agromarket.application.dto.ContactoResponse;
import com.agromarket.application.dto.EnviarMensajeRequest;
import com.agromarket.application.dto.MensajeResponse;

public interface MensajeService {
    MensajeResponse enviar(EnviarMensajeRequest request, Long remitenteId);

    List<MensajeResponse> getConversacion(Long userId1, Long userId2);

    List<ContactoResponse> getContactos(Long userId);

    void marcarLeido(Long mensajeId, Long userId);

    long countNoLeidos(Long userId);
}
