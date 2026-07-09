package com.agromarket.domain.ports;

import java.util.List;

import com.agromarket.application.api.request.ContactoResponse;
import com.agromarket.application.api.request.EnviarMensajeRequest;
import com.agromarket.application.api.response.MensajeResponse;

public interface MensajeService {
    MensajeResponse enviar(EnviarMensajeRequest request, Long remitenteId);

    List<MensajeResponse> getConversacion(Long userId1, Long userId2);

    List<ContactoResponse> getContactos(Long userId);

    void marcarLeido(Long mensajeId, Long userId);

    long countNoLeidos(Long userId);
}
