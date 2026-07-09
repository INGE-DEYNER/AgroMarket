package com.agromarket.domain.services;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import com.agromarket.application.api.request.ContactoResponse;
import com.agromarket.application.api.request.EnviarMensajeRequest;
import com.agromarket.application.api.response.MensajeResponse;
import com.agromarket.application.mapper.MensajeMapper;
import com.agromarket.application.persistence.sql.entities.MensajeEntity;
import com.agromarket.application.persistence.sql.entities.UsuarioEntity;
import com.agromarket.application.persistence.sql.repositories.MensajeJpaRepository;
import com.agromarket.application.persistence.sql.repositories.UsuarioJpaRepository;
import com.agromarket.domain.exception.AccesoDenegadoException;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.domain.ports.MensajeService;

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
            MensajeEntity ultimo = mensajeJpaRepository.findUltimoMensaje(userId, contactoId);
            long noLeidos = mensajeJpaRepository.countByDestinatarioIdAndRemitenteIdAndLeidoFalse(userId, contactoId);
            return ContactoResponse.builder()
                    .usuarioId(contacto.getId())
                    .nombre(contacto.getNombre())
                    .rol(contacto.getRol())
                    .ultimoMensaje(ultimo != null ? ultimo.getContenido() : null)
                    .noLeidos(noLeidos)
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
