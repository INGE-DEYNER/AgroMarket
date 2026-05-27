package com.agromarket.application.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import com.agromarket.application.dto.ContactoResponse;
import com.agromarket.application.dto.EnviarMensajeRequest;
import com.agromarket.application.dto.MensajeResponse;
import com.agromarket.application.mapper.MensajeMapper;
import com.agromarket.domain.exception.AccesoDenegadoException;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.domain.model.RolUsuario;
import com.agromarket.infrastructure.persistence.entity.MensajeEntity;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.MensajeJpaRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MensajeServiceImpl implements MensajeService {
    private final MensajeJpaRepository mensajeJpaRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final MensajeMapper mensajeMapper;

    @Override
    public MensajeResponse enviar(EnviarMensajeRequest request, Long remitenteId) {
        UsuarioEntity remitente = obtenerUsuario(remitenteId);
        UsuarioEntity destinatario = obtenerUsuario(request.getDestinatarioId());
        MensajeEntity mensaje = MensajeEntity.builder()
                .remitente(remitente)
                .destinatario(destinatario)
                .contenido(request.getContenido())
                .leido(false)
                .build();
        return mensajeMapper.toResponse(mensajeJpaRepository.save(mensaje));
    }

    @Override
    public List<MensajeResponse> getConversacion(Long userId1, Long userId2) {
        return mensajeJpaRepository.findConversacion(userId1, userId2).stream().map(mensajeMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<ContactoResponse> getContactos(Long userId) {
        List<Long> contactos = mensajeJpaRepository.findContactosIds(userId);
        return contactos.stream().map(contactoId -> {
            UsuarioEntity contacto = obtenerUsuario(contactoId);
            List<MensajeEntity> conversacion = mensajeJpaRepository.findConversacion(userId, contactoId);
            MensajeEntity ultimo = conversacion.stream().max(Comparator.comparing(MensajeEntity::getFechaEnvio)).orElse(null);
            return ContactoResponse.builder()
                    .usuarioId(contacto.getId())
                    .nombre(contacto.getNombre())
                    .rol(contacto.getRol())
                    .ultimoMensaje(ultimo != null ? ultimo.getContenido() : null)
                    .noLeidos(mensajeJpaRepository.countByDestinatarioIdAndLeidoFalse(userId))
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public void marcarLeido(Long mensajeId, Long userId) {
        MensajeEntity mensaje = mensajeJpaRepository.findById(mensajeId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Mensaje no encontrado"));
        if (mensaje.getDestinatario() == null || !mensaje.getDestinatario().getId().equals(userId)) {
            throw new AccesoDenegadoException("Solo el destinatario puede marcar el mensaje como leído");
        }
        mensaje.setLeido(true);
        mensajeJpaRepository.save(mensaje);
    }

    @Override
    public long countNoLeidos(Long userId) {
        return mensajeJpaRepository.countByDestinatarioIdAndLeidoFalse(userId);
    }

    private UsuarioEntity obtenerUsuario(Long id) {
        return usuarioJpaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
    }
}
