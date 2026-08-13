package com.agromarket.infrastructure.persistence.adapters;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.agromarket.domain.models.Notificacion;
import com.agromarket.domain.ports.out.NotificationRepositoryPort;
import com.agromarket.infrastructure.persistence.mapper.NotificacionMapper;
import com.agromarket.infrastructure.persistence.sql.entities.NotificacionEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.NotificacionJpaRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotificacionJpaAdapter implements NotificationRepositoryPort {

    private final NotificacionJpaRepository notificacionJpaRepository;
    private final NotificacionMapper notificacionMapper;

    @Override
    public Optional<Notificacion> findById(Long id) {
        return notificacionJpaRepository.findById(id).map(notificacionMapper::toDomain);
    }

    @Override
    public List<Notificacion> findByRecipientId(Long userId) {
        return notificacionJpaRepository.findByUsuarioIdOrderByFechaCreacionDesc(userId).stream()
                .map(notificacionMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Notificacion> findUnreadByRecipientId(Long userId) {
        return notificacionJpaRepository.findByUsuarioIdAndLeidaFalseOrderByFechaCreacionDesc(userId).stream()
                .map(notificacionMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Notificacion save(Notificacion notification) {
        NotificacionEntity entity = notificacionMapper.toEntity(notification);
        NotificacionEntity savedEntity = notificacionJpaRepository.save(entity);
        return notificacionMapper.toDomain(savedEntity);
    }

    @Override
    public void markAllAsRead(Long userId) {
        notificacionJpaRepository.marcarTodasComoLeidas(userId);
    }
}
