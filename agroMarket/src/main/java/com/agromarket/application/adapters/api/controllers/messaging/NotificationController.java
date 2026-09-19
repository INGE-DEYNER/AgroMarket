package com.agromarket.application.adapters.api.controllers.messaging;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agromarket.application.adapters.api.request.messaging.CreateNotificationRequest;
import com.agromarket.application.adapters.api.response.messaging.NotificationResponse;
import com.agromarket.domain.models.messaging.Notification;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.in.messaging.MessagingPort;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final MessagingPort messagingPort;

    @PostMapping
    public ResponseEntity<NotificationResponse> create(
            @Valid @RequestBody CreateNotificationRequest request) {
        Notification notification = Notification.builder()
                .recipient(User.builder().id(request.getRecipientId()).build())
                .type(request.getType())
                .content(request.getContent())
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        Notification saved = messagingPort.createNotification(notification);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getByUser(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
                messagingPort.getNotifications(userId)
                        .stream().map(this::toResponse).toList());
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable String notificationId) {
        return ResponseEntity.ok(
                toResponse(messagingPort.markAsRead(notificationId)));
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.fromDomain(notification);
    }
}
