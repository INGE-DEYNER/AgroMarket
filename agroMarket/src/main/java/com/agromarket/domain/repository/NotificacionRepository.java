package com.agromarket.domain.repository;

import java.util.List;

import com.agromarket.domain.model.Notificacion;

public interface NotificacionRepository {
    List<Notificacion> findByDestinatarioId(Long userId);

    long countNoLeidas(Long userId);

    Notificacion save(Notificacion notificacion);

    void marcarTodasLeidas(Long userId);
}
