package com.agromarket.application.ports.in;

import java.util.List;

import com.agromarket.interfaces.rest.request.ContactoResponse;
import com.agromarket.interfaces.rest.request.EnviarMensajeRequest;
import com.agromarket.interfaces.rest.response.MensajeResponse;

public interface MensajeService {
    MensajeResponse enviar(EnviarMensajeRequest request, Long remitenteId);

    List<MensajeResponse> getConversacion(Long userId1, Long userId2);

    List<ContactoResponse> getContactos(Long userId);

    void marcarLeido(Long mensajeId, Long userId);

    long countNoLeidos(Long userId);
}
