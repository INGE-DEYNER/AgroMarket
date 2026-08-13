package com.agromarket.application.ports.in;

import java.util.List;

import com.agromarket.interfaces.rest.response.NotificacionResponse;

public interface NotificacionService {
    List<NotificacionResponse> getMias(Long userId);

    long countNoLeidas(Long userId);

    void marcarTodasLeidas(Long userId);
}
