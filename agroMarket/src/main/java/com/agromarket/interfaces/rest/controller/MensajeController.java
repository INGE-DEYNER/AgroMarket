package com.agromarket.interfaces.rest.controller;

import java.util.List;

import com.agromarket.application.dto.ApiResponse;
import com.agromarket.application.dto.ContactoResponse;
import com.agromarket.application.dto.EnviarMensajeRequest;
import com.agromarket.application.dto.MensajeResponse;
import com.agromarket.application.service.MensajeService;
import com.agromarket.infrastructure.security.JwtUserPrincipal;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mensajes")
@RequiredArgsConstructor
public class MensajeController {
    private final MensajeService mensajeService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MensajeResponse>> enviar(@Valid @RequestBody EnviarMensajeRequest request, @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<MensajeResponse>builder().success(true).message("Mensaje enviado").data(mensajeService.enviar(request, principal.getUserId())).build());
    }

    @GetMapping("/conversacion/{otroUserId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<MensajeResponse>>> conversacion(@PathVariable Long otroUserId, @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<List<MensajeResponse>>builder().success(true).message("Conversación recuperada").data(mensajeService.getConversacion(principal.getUserId(), otroUserId)).build());
    }

    @GetMapping("/contactos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ContactoResponse>>> contactos(@AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<List<ContactoResponse>>builder().success(true).message("Contactos recuperados").data(mensajeService.getContactos(principal.getUserId())).build());
    }

    @PutMapping("/{id}/leer")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> marcarLeido(@PathVariable Long id, @AuthenticationPrincipal JwtUserPrincipal principal) {
        mensajeService.marcarLeido(id, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Mensaje marcado como leído").build());
    }

    @GetMapping("/no-leidos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> noLeidos(@AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<Long>builder().success(true).message("Conteo recuperado").data(mensajeService.countNoLeidos(principal.getUserId())).build());
    }
}
