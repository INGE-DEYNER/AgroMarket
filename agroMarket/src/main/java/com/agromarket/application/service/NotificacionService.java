package com.agromarket.application.service;

import java.util.List;

import com.agromarket.application.dto.NotificacionResponse;

public interface NotificacionService {
    List<NotificacionResponse> getMias(Long userId);

    long countNoLeidas(Long userId);

    void marcarTodasLeidas(Long userId);
}
