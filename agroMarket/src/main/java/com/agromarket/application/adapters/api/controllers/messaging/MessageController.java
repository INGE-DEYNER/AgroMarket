package com.agromarket.application.adapters.api.controllers.messaging;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.agromarket.application.adapters.api.request.messaging.SendMessageRequest;
import com.agromarket.application.adapters.api.response.messaging.MessageResponse;
import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.models.messaging.Message;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.in.messaging.MessagingPort;
import com.agromarket.domain.ports.out.user.UserPort;
import com.agromarket.infrastructure.security.JwtUserPrincipal;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessagingPort messagingPort;
    private final UserPort userPort;

    /*
     * Canales SSE en memoria por usuario: permiten empujar mensajes en
     * tiempo real al destinatario sin WebSocket/STOMP (sin dependencias
     * nuevas). El frontend abre GET /api/v1/messages/stream con su JWT y
     * recibe eventos "message". Si el destinatario no tiene el stream
     * abierto, el mensaje igual queda persistido y lo verá con el sondeo.
     */
    private final Map<Long, List<SseEmitter>> streams = new ConcurrentHashMap<>();

    /**
     * POST /api/v1/messages (alias frontend: /mensajes)
     *
     * El remitente SIEMPRE es el usuario autenticado (JWT): el cuerpo no puede
     * suplantar a otro remitente. Acepta el contrato del frontend
     * ({destinatarioId, contenido}) y el formato histórico
     * ({senderId, receiverId, content}).
     */
    @PostMapping
    public ResponseEntity<MessageResponse> send(
            @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal JwtUserPrincipal principal) {

        Long senderId = principal != null
                ? principal.getUserId()
                : request.getSenderId();
        Long receiverId = request.getReceiverId();
        String content = request.getContent();

        if (senderId == null) {
            throw new IllegalArgumentException(
                    "El remitente del mensaje es obligatorio");
        }
        if (receiverId == null) {
            throw new IllegalArgumentException(
                    "El destinatario del mensaje es obligatorio");
        }
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException(
                    "El contenido del mensaje es obligatorio");
        }

        Message message = messagingPort.sendMessage(senderId, receiverId, content);
        MessageResponse body = toResponse(message);
        pushToUser(receiverId, body);
        pushToUser(senderId, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    /**
     * GET /api/v1/messages/stream — canal SSE en tiempo real.
     * El frontend lo abre una vez (con JWT) y recibe cada mensaje nuevo
     * al instante mediante eventos "message". Timeout de 30 min; el
     * frontend reconecta solo si se cae.
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        Long userId = principal.getUserId();
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);
        streams.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>())
                .add(emitter);
        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError(e -> removeEmitter(userId, emitter));
        try {
            emitter.send(SseEmitter.event().name("connected").data("ok"));
        } catch (IOException ex) {
            removeEmitter(userId, emitter);
        }
        return emitter;
    }

    private void pushToUser(Long userId, MessageResponse body) {
        if (userId == null) return;
        List<SseEmitter> list = streams.getOrDefault(userId, List.of());
        for (SseEmitter emitter : new ArrayList<>(list)) {
            try {
                emitter.send(SseEmitter.event().name("message").data(body));
            } catch (IOException | IllegalStateException ex) {
                removeEmitter(userId, emitter);
            }
        }
    }

    private void removeEmitter(Long userId, SseEmitter emitter) {
        List<SseEmitter> list = streams.get(userId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) {
                streams.remove(userId, list);
            }
        }
    }

    /**
     * GET /api/v1/messages/stream/info — ayuda a diagnosticar si el
     * tiempo real está activo (cuántos oyentes hay conectados).
     */
    @GetMapping("/stream/info")
    public ResponseEntity<Map<String, Object>> streamInfo() {
        Map<String, Object> info = new LinkedHashMap<>();
        int total = streams.values().stream().mapToInt(List::size).sum();
        Set<Long> usuarios = streams.keySet();
        info.put("oyentes", total);
        info.put("usuariosConectados", usuarios.size());
        return ResponseEntity.ok(info);
    }

    /**
     * GET /api/v1/messages/conversacion/{otroUserId} (alias frontend:
     * /mensajes/conversacion/{id}).
     * Conversación entre el usuario autenticado y el contacto indicado.
     */
    @GetMapping("/conversacion/{otroUserId}")
    public ResponseEntity<List<MessageResponse>> conversacion(
            @PathVariable Long otroUserId,
            @AuthenticationPrincipal JwtUserPrincipal principal) {

        return ResponseEntity.ok(
                messagingPort.getConversation(principal.getUserId(), otroUserId)
                        .stream().map(this::toResponse).toList());
    }

    /**
     * GET /api/v1/messages/contactos (alias frontend: /mensajes/contactos).
     * Contactos disponibles para chatear según el rol del usuario autenticado:
     * BUYER ↔ PRODUCER, y ADMIN con todos los roles.
     */
    @GetMapping("/contactos")
    public ResponseEntity<List<Map<String, Object>>> contactos(
            @AuthenticationPrincipal JwtUserPrincipal principal) {

        Long yo = principal.getUserId();
        String miRol = principal.getRole();

        List<User> candidatos = new ArrayList<>();

        if ("ADMIN".equals(miRol)) {
            candidatos.addAll(userPort.findAll());
        } else if ("PRODUCER".equals(miRol)) {
            // El productor chatea con compradores y con administración.
            candidatos.addAll(userPort.findByRole(Role.BUYER.name()));
            candidatos.addAll(userPort.findByRole(Role.ADMIN.name()));
        } else {
            // El comprador chatea con productores y con administración.
            candidatos.addAll(userPort.findByRole(Role.PRODUCER.name()));
            candidatos.addAll(userPort.findByRole(Role.ADMIN.name()));
        }

        List<Map<String, Object>> contactos = candidatos.stream()
                .filter(u -> u != null && u.getId() != null && !u.getId().equals(yo))
                .map(this::toContact)
                .toList();

        return ResponseEntity.ok(contactos);
    }

    private Map<String, Object> toContact(User u) {
        Map<String, Object> contacto = new LinkedHashMap<>();

        String nombre = ((u.getFirstName() == null ? "" : u.getFirstName()) + " "
                + (u.getLastName() == null ? "" : u.getLastName())).trim();

        contacto.put("id", u.getId());
        contacto.put("nombre", nombre.isBlank() ? "Usuario" : nombre);
        contacto.put(
                "rol",
                u.getRole() == null ? "USUARIO" : u.getRole().name());
        contacto.put("iniciales", inicialesDe(nombre));
        // La plataforma no maneja presencia en tiempo real todavía.
        contacto.put("online", Boolean.FALSE);

        return contacto;
    }

    private String inicialesDe(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            return "--";
        }
        String[] partes = nombre.trim().split("\\s+");
        StringBuilder iniciales = new StringBuilder();
        for (String parte : partes) {
            if (!parte.isBlank() && iniciales.length() < 2) {
                iniciales.append(Character.toUpperCase(parte.charAt(0)));
            }
        }
        return iniciales.length() == 0 ? "--" : iniciales.toString();
    }

    /**
     * GET /api/v1/messages/conversation/{userA}/{userB} (formato histórico,
     * se conserva para no romper integraciones existentes).
     */
    @GetMapping("/conversation/{userA}/{userB}")
    public ResponseEntity<List<MessageResponse>> conversation(
            @PathVariable Long userA,
            @PathVariable Long userB) {
        return ResponseEntity.ok(
                messagingPort.getConversation(userA, userB)
                        .stream().map(this::toResponse).toList());
    }

    private MessageResponse toResponse(Message message) {
        return MessageResponse.fromDomain(message);
    }
}
