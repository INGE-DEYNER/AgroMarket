package com.agromarket.interfaces.rest.controllers;

import java.util.List;

import com.agromarket.interfaces.rest.response.ApiResponse;
import com.agromarket.interfaces.rest.response.NotificacionResponse;
import com.agromarket.application.ports.in.NotificacionService;
import com.agromarket.infrastructure.security.JwtUserPrincipal;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {
    private final NotificacionService notificacionService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<NotificacionResponse>>> getMias(@AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<List<NotificacionResponse>>builder().success(true).message("Notificaciones recuperadas").data(notificacionService.getMias(principal.getUserId())).build());
    }

    @GetMapping("/no-leidas")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> countNoLeidas(@AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<Long>builder().success(true).message("Conteo recuperado").data(notificacionService.countNoLeidas(principal.getUserId())).build());
    }

    @PutMapping("/leer-todas")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> marcarTodasLeidas(@AuthenticationPrincipal JwtUserPrincipal principal) {
        notificacionService.marcarTodasLeidas(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Notificaciones marcadas como leídas").build());
    }
}
