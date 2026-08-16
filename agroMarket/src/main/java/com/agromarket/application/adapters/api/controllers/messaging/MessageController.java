package com.agromarket.application.adapters.api.controllers.messaging;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agromarket.application.adapters.api.request.messaging.SendMessageRequest;
import com.agromarket.application.adapters.api.response.messaging.MessageResponse;
import com.agromarket.domain.models.messaging.Message;
import com.agromarket.domain.ports.in.messaging.MessagingPort;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessagingPort messagingPort;

    @PostMapping
    public ResponseEntity<MessageResponse> send(
            @Valid @RequestBody SendMessageRequest request) {
        Message message = messagingPort.sendMessage(
                request.getSenderId(),
                request.getReceiverId(),
                request.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(message));
    }

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
