package com.agromarket.domain.ports;

import java.util.List;

import com.agromarket.application.api.response.NotificacionResponse;

public interface NotificacionService {
    List<NotificacionResponse> getMias(Long userId);

    long countNoLeidas(Long userId);

    void marcarTodasLeidas(Long userId);
}
