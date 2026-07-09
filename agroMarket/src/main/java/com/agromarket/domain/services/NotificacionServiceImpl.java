package com.agromarket.domain.services;

import java.util.List;

import com.agromarket.application.api.response.NotificacionResponse;
import com.agromarket.application.mapper.NotificacionMapper;
import com.agromarket.application.persistence.sql.repositories.NotificacionJpaRepository;
import com.agromarket.domain.ports.NotificacionService;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificacionServiceImpl implements NotificacionService {
    private final NotificacionJpaRepository notificacionJpaRepository;
    private final NotificacionMapper notificacionMapper;

    @Override
    public List<NotificacionResponse> getMias(Long userId) {
        return notificacionJpaRepository.findByDestinatarioId(userId).stream().map(notificacionMapper::toResponse).toList();
    }

    @Override
    public long countNoLeidas(Long userId) {
        return notificacionJpaRepository.countByDestinatarioIdAndLeidaFalse(userId);
    }

    @Override
    public void marcarTodasLeidas(Long userId) {
        notificacionJpaRepository.marcarTodasLeidas(userId);
    }
}
