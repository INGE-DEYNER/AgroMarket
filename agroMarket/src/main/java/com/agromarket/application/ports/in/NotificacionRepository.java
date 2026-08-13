package com.agromarket.application.ports.in;

import java.util.List;

import com.agromarket.domain.models.Notificacion;

public interface NotificacionRepository {
    List<Notificacion> findByDestinatarioId(Long userId);

    long countNoLeidas(Long userId);

    Notificacion save(Notificacion notificacion);

    void marcarTodasLeidas(Long userId);
}
