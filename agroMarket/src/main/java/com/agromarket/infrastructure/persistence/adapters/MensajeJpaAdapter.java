package com.agromarket.infrastructure.persistence.adapters;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.agromarket.domain.models.Mensaje;
import com.agromarket.domain.ports.out.MessageRepositoryPort;
import com.agromarket.infrastructure.persistence.mapper.MensajeMapper;
import com.agromarket.infrastructure.persistence.sql.entities.MensajeEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.MensajeJpaRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MensajeJpaAdapter implements MessageRepositoryPort {

    private final MensajeJpaRepository mensajeJpaRepository;
    private final MensajeMapper mensajeMapper;

    @Override
    public Optional<Mensaje> findById(Long id) {
        return mensajeJpaRepository.findById(id).map(mensajeMapper::toDomain);
    }

    @Override
    public List<Mensaje> findBySenderId(Long senderId) {
        return mensajeJpaRepository.findByEmisorId(senderId).stream()
                .map(mensajeMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Mensaje> findByRecipientId(Long recipientId) {
        return mensajeJpaRepository.findByReceptorId(recipientId).stream()
                .map(mensajeMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Mensaje> findConversation(Long userId1, Long userId2) {
        return mensajeJpaRepository.findConversacion(userId1, userId2).stream()
                .map(mensajeMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Mensaje save(Mensaje message) {
        MensajeEntity entity = mensajeMapper.toEntity(message);
        MensajeEntity savedEntity = mensajeJpaRepository.save(entity);
        return mensajeMapper.toDomain(savedEntity);
    }
}
