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

import com.agromarket.application.adapters.api.request.messaging.CreateTicketRequest;
import com.agromarket.application.adapters.api.request.messaging.SendMessageRequest;
import com.agromarket.application.adapters.api.request.messaging.TicketMessageRequest;
import com.agromarket.application.adapters.api.response.messaging.MessageResponse;
import com.agromarket.application.adapters.api.response.messaging.TicketResponse;
import com.agromarket.domain.models.enums.messaging.NotificationType;
import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.models.messaging.Message;
import com.agromarket.domain.models.messaging.Notification;
import com.agromarket.domain.models.messaging.Ticket;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.in.messaging.MessagingPort;
import com.agromarket.domain.ports.out.user.UserPort;
import com.agromarket.domain.services.messaging.MessagingService;
import com.agromarket.infrastructure.security.JwtUserPrincipal;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory
            .getLogger(MessageController.class);

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

    private void pushToUser(Long userId, Object body) {
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

    /**
     * Empuja un ticket (creado o actualizado) por SSE. El frontend escucha
     * el evento "ticket" para refrescar la bandeja desde el backend.
     */
    private void pushTicketToUser(Long userId, TicketResponse body) {
        if (userId == null) return;
        List<SseEmitter> list = streams.getOrDefault(userId, List.of());
        for (SseEmitter emitter : new ArrayList<>(list)) {
            try {
                emitter.send(SseEmitter.event().name("ticket").data(body));
            } catch (IOException | IllegalStateException ex) {
                removeEmitter(userId, emitter);
            }
        }
    }

    private Role parseRole(String role) {
        if (role == null || role.isBlank()) {
            return null;
        }
        try {
            return Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
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
        Role miRol = parseRole(principal.getRole());

        List<User> candidatos = new ArrayList<>();

        if (MessagingService.isAdmin(miRol)) {
            /*
             * La administración puede iniciar conversación con cualquier
             * comprador o productor.
             */
            candidatos.addAll(userPort.findByRole(Role.BUYER.name()));
            candidatos.addAll(userPort.findByRole(Role.PRODUCER.name()));
        } else {
            /*
             * Comprador ↔ Productor es libre. La administración solo aparece
             * como contacto cuando YA inició una conversación: mientras eso
             * no pase, el canal con administración son los tickets.
             */
            Role rolContraparte = MessagingService.isProducer(miRol)
                    ? Role.BUYER
                    : Role.PRODUCER;
            candidatos.addAll(userPort.findByRole(rolContraparte.name()));
            candidatos.addAll(administracionesQueYaEscribieron(yo));
        }

        Map<Long, User> porId = new LinkedHashMap<>();
        for (User candidato : candidatos) {
            if (candidato == null || candidato.getId() == null) continue;
            if (candidato.getId().equals(yo)) continue;
            porId.putIfAbsent(candidato.getId(), candidato);
        }

        List<Map<String, Object>> contactos = porId.values().stream()
                .map(this::toContact)
                .toList();

        return ResponseEntity.ok(contactos);
    }

    /**
     * Administraciones que ya escribieron al usuario. Como la regla dice que
     * Comprador/Productor no puede iniciar la conversación con administración,
     * el usuario solo ve a la administración si ya recibió un mensaje suyo.
     */
    private List<User> administracionesQueYaEscribieron(Long usuarioId) {

        if (usuarioId == null) {
            return List.of();
        }

        return userPort.findByRole(Role.ADMIN.name()).stream()
                .filter(admin -> admin != null && admin.getId() != null)
                .filter(admin -> messagingPort
                        .getConversation(admin.getId(), usuarioId)
                        .stream()
                        .anyMatch(message -> message != null
                                && message.getSender() != null
                                && admin.getId()
                                        .equals(message.getSender().getId())))
                .toList();
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

    // ==================== TICKETS DE SOPORTE ====================

    /**
     * POST /api/v1/messages/tickets (alias frontend: /mensajes/tickets).
     *
     * Canal oficial para que un comprador o productor se comunique con la
     * administración (regla de comunicación de Asafrut).
     */
    @PostMapping("/tickets")
    public ResponseEntity<TicketResponse> crearTicket(
            @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal JwtUserPrincipal principal) {

        Ticket nuevo = Ticket.builder()
                .creatorId(principal.getUserId())
                .subject(request.getSubject())
                .description(request.getDescription())
                .build();

        Ticket guardado = messagingPort.createTicket(nuevo);
        TicketResponse body = TicketResponse.fromDomain(guardado);

        notificarAdministracionNuevoTicket(guardado);

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    /**
     * GET /api/v1/messages/tickets
     * El usuario ve sus tickets; la administración ve todos.
     */
    @GetMapping("/tickets")
    public ResponseEntity<List<TicketResponse>> listarTickets(
            @AuthenticationPrincipal JwtUserPrincipal principal) {

        return ResponseEntity.ok(
                messagingPort.getTickets(
                        principal.getUserId(),
                        parseRole(principal.getRole()))
                        .stream().map(TicketResponse::fromDomain).toList());
    }

    /**
     * GET /api/v1/messages/tickets/{ticketId}
     * Solo el creador o la administración.
     */
    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<TicketResponse> verTicket(
            @PathVariable String ticketId,
            @AuthenticationPrincipal JwtUserPrincipal principal) {

        return ResponseEntity.ok(TicketResponse.fromDomain(
                messagingPort.getTicket(
                        ticketId,
                        principal.getUserId(),
                        parseRole(principal.getRole()))));
    }

    /**
     * POST /api/v1/messages/tickets/{ticketId}/mensajes
     * Respuesta dentro del ticket: creador ↔ administración.
     */
    @PostMapping("/tickets/{ticketId}/mensajes")
    public ResponseEntity<TicketResponse> responderTicket(
            @PathVariable String ticketId,
            @RequestBody TicketMessageRequest request,
            @AuthenticationPrincipal JwtUserPrincipal principal) {

        Role rol = parseRole(principal.getRole());

        Ticket actualizado = messagingPort.addTicketMessage(
                ticketId,
                principal.getUserId(),
                rol,
                request.getContent());

        TicketResponse body = TicketResponse.fromDomain(actualizado);

        notificarRespuestaTicket(actualizado, principal.getUserId(), rol);

        return ResponseEntity.ok(body);
    }

    /**
     * Notifica a toda la administración del ticket nuevo: centro de
     * notificaciones (Mongo) + empujón SSE para que aparezca al instante.
     */
    private void notificarAdministracionNuevoTicket(Ticket ticket) {

        if (ticket == null) {
            return;
        }

        String contenido = "Nuevo ticket de soporte de "
                + (ticket.getCreatorName() == null
                        ? "un usuario"
                        : ticket.getCreatorName())
                + ": " + ticket.getSubject();

        TicketResponse body = TicketResponse.fromDomain(ticket);

        for (User admin : userPort.findByRole(Role.ADMIN.name())) {
            if (admin == null || admin.getId() == null) continue;

            crearNotificacionSegura(admin.getId(), contenido);
            pushTicketToUser(admin.getId(), body);
        }
    }

    /**
     * Notifica del nuevo mensaje del ticket a la contraparte:
     * si respondió el usuario, avisa a la administración; si respondió la
     * administración, avisa al creador.
     */
    private void notificarRespuestaTicket(
            Ticket ticket,
            Long authorId,
            Role authorRole) {

        if (ticket == null) {
            return;
        }

        String contenido = "Nuevo mensaje en el ticket \""
                + ticket.getSubject() + "\"";

        TicketResponse body = TicketResponse.fromDomain(ticket);

        if (MessagingService.isAdmin(authorRole)) {
            crearNotificacionSegura(ticket.getCreatorId(), contenido);
            pushTicketToUser(ticket.getCreatorId(), body);
            return;
        }

        for (User admin : userPort.findByRole(Role.ADMIN.name())) {
            if (admin == null || admin.getId() == null) continue;
            if (admin.getId().equals(authorId)) continue;

            crearNotificacionSegura(admin.getId(), contenido);
            pushTicketToUser(admin.getId(), body);
        }
    }

    /**
     * Crea la notificación sin romper la operación principal si falla el
     * centro de notificaciones.
     */
    private void crearNotificacionSegura(Long recipientId, String contenido) {
        if (recipientId == null) {
            return;
        }

        try {
            messagingPort.createNotification(Notification.builder()
                    .recipient(User.builder().id(recipientId).build())
                    .type(NotificationType.NEW_MESSAGE)
                    .content(contenido)
                    .build());
        } catch (RuntimeException ex) {
            log.warn("No se pudo crear la notificación del ticket para {}: {}",
                    recipientId, ex.getMessage());
        }
    }

    private MessageResponse toResponse(Message message) {
        return MessageResponse.fromDomain(message);
    }
}
