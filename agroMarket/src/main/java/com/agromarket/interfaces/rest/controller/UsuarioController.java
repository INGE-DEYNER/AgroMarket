package com.agromarket.interfaces.rest.controller;

import com.agromarket.application.dto.CambiarContrasenaRequest;
import com.agromarket.application.dto.ActualizarUsuarioRequest;
import com.agromarket.application.dto.ApiResponse;
import com.agromarket.application.dto.UsuarioResponse;
import com.agromarket.application.service.UsuarioService;
import com.agromarket.infrastructure.security.JwtUserPrincipal;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Validated
public class UsuarioController {
    private final UsuarioService usuarioService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UsuarioResponse>> me(@AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<UsuarioResponse>builder().success(true).message("Perfil recuperado").data(usuarioService.getById(principal.getUserId())).build());
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UsuarioResponse>> actualizarMe(@AuthenticationPrincipal JwtUserPrincipal principal, @Valid @RequestBody ActualizarUsuarioRequest request) {
        return ResponseEntity.ok(ApiResponse.<UsuarioResponse>builder()
                .success(true)
                .message("Perfil actualizado")
                .data(usuarioService.actualizar(principal.getUserId(), request))
                .build());
    }

    @PutMapping("/mi-perfil")
    public ResponseEntity<ApiResponse<UsuarioResponse>> actualizarMiPerfil(@AuthenticationPrincipal JwtUserPrincipal principal, @Valid @RequestBody ActualizarUsuarioRequest request) {
        return actualizarMe(principal, request);
    }

    @PutMapping("/me/contrasena")
    public ResponseEntity<ApiResponse<Void>> actualizarContrasena(@AuthenticationPrincipal JwtUserPrincipal principal,
                                                                  @Valid @RequestBody CambiarContrasenaRequest request) {
        usuarioService.actualizarContrasena(principal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Contraseña actualizada")
                .build());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<java.util.List<UsuarioResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.<java.util.List<UsuarioResponse>>builder().success(true).message("Usuarios listados").data(usuarioService.getAll()).build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<UsuarioResponse>> getById(@PathVariable @Positive Long id) {
        return ResponseEntity.ok(ApiResponse.<UsuarioResponse>builder()
                .success(true)
                .message("Usuario recuperado")
                .data(usuarioService.getById(id))
                .build());
    }

    @PutMapping("/{id}/habilitar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> habilitar(@PathVariable @Positive Long id) {
        usuarioService.habilitar(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Usuario habilitado")
                .build());
    }

    @PutMapping("/{id}/deshabilitar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> deshabilitar(@PathVariable @Positive Long id) {
        usuarioService.deshabilitar(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Usuario deshabilitado")
                .build());
    }
}
