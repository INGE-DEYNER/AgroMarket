package com.agromarket.interfaces.rest.controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.agromarket.interfaces.rest.response.ApiResponse;
import com.agromarket.application.ports.in.ImagenService;
import com.agromarket.infrastructure.security.JwtUserPrincipal;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ImagenController {

    private final ImagenService imagenService;

    @PostMapping("/{id}/imagen")
    @PreAuthorize("hasAnyRole('PRODUCTOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImagen(
            @PathVariable("id") Long productoId,
            @RequestParam("imagen") MultipartFile imagen,
            @AuthenticationPrincipal JwtUserPrincipal principal) {

        String url = imagenService.uploadProductoImagen(productoId, imagen, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<Map<String, String>>builder().success(true).message("Imagen subida").data(Map.of("url", url)).build());
    }
}
