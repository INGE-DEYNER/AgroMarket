package com.agromarket.interfaces.rest.controller;

import java.math.BigDecimal;
import java.net.URI;

import com.agromarket.application.dto.ActualizarProductoRequest;
import com.agromarket.application.dto.ApiResponse;
import com.agromarket.application.dto.CrearProductoRequest;
import com.agromarket.application.dto.PageResponse;
import com.agromarket.application.dto.ProductoResponse;
import com.agromarket.application.service.ProductoService;
import com.agromarket.domain.model.TipoFruta;
import com.agromarket.infrastructure.security.JwtUserPrincipal;

import jakarta.validation.Valid;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings({"null", "unused"})
public class ProductoController {
    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductoResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TipoFruta tipo,
            @RequestParam(required = false) BigDecimal precioMin,
            @RequestParam(required = false) BigDecimal precioMax) {
        ApiResponse<PageResponse<ProductoResponse>> body = ApiResponse.<PageResponse<ProductoResponse>>builder().success(true).message("Productos listados").data(productoService.getAll(page, size, search, tipo, precioMin, precioMax)).build();
        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(30, java.util.concurrent.TimeUnit.SECONDS).cachePublic())
            .body(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductoResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<ProductoResponse>builder().success(true).message("Producto recuperado").data(productoService.getById(id)).build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PRODUCTOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<ProductoResponse>> crear(@Valid @RequestBody CrearProductoRequest request, @AuthenticationPrincipal JwtUserPrincipal principal) {
        log.info("Creando producto para usuario {}", principal.getUserId());
        ProductoResponse response = productoService.crear(request, principal.getUserId());
        URI location = java.util.Objects.requireNonNull(URI.create("/api/productos/" + response.getId()));
        return ResponseEntity.created(location).body(ApiResponse.<ProductoResponse>builder().success(true).message("Producto creado").data(response).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PRODUCTOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<ProductoResponse>> actualizar(@PathVariable Long id, @Valid @RequestBody ActualizarProductoRequest request, @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.<ProductoResponse>builder().success(true).message("Producto actualizado").data(productoService.actualizar(id, request, principal.getUserId())).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PRODUCTOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id, @AuthenticationPrincipal JwtUserPrincipal principal) {
        productoService.eliminar(id, principal.getUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/mis-productos")
    @PreAuthorize("hasAnyRole('PRODUCTOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<PageResponse<ProductoResponse>>> misProductos(@AuthenticationPrincipal JwtUserPrincipal principal,
                                                                                    @RequestParam(defaultValue = "0") int page,
                                                                                    @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(ApiResponse.<PageResponse<ProductoResponse>>builder().success(true).message("Productos del productor").data(productoService.getMisProductos(principal.getUserId(), page, size)).build());
    }
}
