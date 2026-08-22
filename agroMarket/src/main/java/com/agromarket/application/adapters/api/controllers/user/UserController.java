package com.agromarket.application.adapters.api.controllers.user;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import com.agromarket.application.adapters.api.request.user.ChangePasswordRequest;
import com.agromarket.application.adapters.api.request.user.UpdateProfileRequest;
import com.agromarket.application.adapters.api.request.user.UpdateUserRequest;
import com.agromarket.application.adapters.api.response.user.OperationResponse;
import com.agromarket.application.adapters.api.response.user.UserResponse;
import com.agromarket.domain.ports.in.user.UpdateProfileCommand;
import com.agromarket.domain.ports.in.user.UserPort;
import com.agromarket.domain.ports.in.user.UserResult;
import com.agromarket.infrastructure.security.JwtUserPrincipal;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserPort userPort;

    public UserController(UserPort userPort) {
        this.userPort = userPort;
    }

    // =========================================================
    // PERFIL DEL USUARIO AUTENTICADO ("/me")
    // =========================================================
    // NOTA: estas rutas no están en isPublicEndpoint(...) de
    // JwtAuthenticationFilter ni en el permitAll() de SecurityConfig
    // (que solo cubre /api/v1/auth/**, /api/v1/products/**, etc.), por lo
    // que ya caen bajo `.anyRequest().authenticated()`. No se requiere
    // ningún cambio adicional de seguridad para exponerlas.

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(toResponse(userPort.getProfile(principal.getUserId())));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMe(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(
                toResponse(userPort.updateProfile(principal.getUserId(), toCommand(request))));
    }

    /**
     * Alias de PUT /me. El frontend lo invoca en algunas pantallas
     * (revisar DashboardProductor.jsx / DashboardComprador.jsx); hasta no
     * confirmar que tenga un propósito distinto, se trata como el mismo
     * endpoint para no duplicar lógica.
     */
    @PutMapping("/mi-perfil")
    public ResponseEntity<UserResponse> updateMiPerfil(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        return updateMe(principal, request);
    }

    @PutMapping("/me/contrasena")
    public ResponseEntity<OperationResponse> changeOwnPassword(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        userPort.changeOwnPassword(
                principal.getUserId(),
                request.currentPassword(),
                request.newPassword());
        return ResponseEntity.ok(OperationResponse.success("Contraseña actualizada correctamente"));
    }

    // =========================================================
    // CRUD GENERAL (admin / consulta por id)
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(userPort.getById(id)));
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<UserResponse> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(userPort.getProfile(id)));
    }

    /**
     * Acepta filtros opcionales `rol`, `page`, `size` como pide el frontend
     * (GET /api/v1/usuarios?rol=PRODUCTOR&page=0&size=20). El repositorio
     * expuesto por UserPort.getAll() no pagina a nivel de base de datos, así
     * que se filtra/pagina en memoria (aceptable dado el volumen esperado;
     * si la tabla crece mucho, esto debería moverse a una query paginada
     * real en el Port de salida).
     *
     * `rol` acepta tanto el nombre del enum en inglés (PRODUCER, BUYER,
     * ADMIN) como los alias en español más comunes (PRODUCTOR, COMPRADOR)
     * para no romper al frontend si manda cualquiera de los dos.
     */
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAll(
            @RequestParam(required = false) String rol,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {

        List<UserResponse> all = userPort.getAll().stream().map(this::toResponse).toList();

        List<UserResponse> filtered = rol == null || rol.isBlank()
                ? all
                : all.stream()
                        .filter(u -> u.role() != null && matchesRole(u.role().name(), rol))
                        .toList();

        int from = Math.max(0, page) * Math.max(1, size);
        if (from >= filtered.size()) {
            return ResponseEntity.ok(List.of());
        }
        int to = Math.min(filtered.size(), from + Math.max(1, size));

        return ResponseEntity.ok(filtered.subList(from, to));
    }

    private boolean matchesRole(String actualRole, String requestedRole) {
        String normalizedRequested = switch (requestedRole.toUpperCase()) {
            case "PRODUCTOR" -> "PRODUCER";
            case "COMPRADOR" -> "BUYER";
            default -> requestedRole.toUpperCase();
        };
        return actualRole.equalsIgnoreCase(normalizedRequested);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(
                toResponse(userPort.update(id, toCommand(request))));
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(
                toResponse(userPort.updateProfile(id, toCommand(request))));
    }

    // =========================================================
    // HABILITAR / DESHABILITAR
    // =========================================================
    // El frontend llama con `api.put(...)`, mientras el backend original
    // solo aceptaba PATCH. Decisión tomada: aceptar AMBOS verbos (PATCH y
    // PUT) en la ruta en inglés y en español, en vez de forzar un cambio en
    // el frontend. Así no se rompe nada que ya funcione con PATCH.

    @RequestMapping(path = { "/{id}/enable", "/{id}/habilitar" }, method = { RequestMethod.PATCH,
            RequestMethod.PUT })
    public ResponseEntity<OperationResponse> enable(@PathVariable Long id) {
        userPort.enable(id);
        return ResponseEntity.ok(OperationResponse.success("Usuario habilitado"));
    }

    @RequestMapping(path = { "/{id}/disable", "/{id}/deshabilitar" }, method = { RequestMethod.PATCH,
            RequestMethod.PUT })
    public ResponseEntity<OperationResponse> disable(@PathVariable Long id) {
        userPort.disable(id);
        return ResponseEntity.ok(OperationResponse.success("Usuario deshabilitado"));
    }

    private UpdateProfileCommand toCommand(UpdateUserRequest r) {
        return UpdateProfileCommand.builder()
                .firstName(r.firstName()).lastName(r.lastName()).phone(r.phone())
                .countryCode(r.countryCode()).location(r.location()).idNumber(r.idNumber())
                .birthDate(r.birthDate()).idType(r.idType()).companyName(r.companyName())
                .nit(r.nit()).isCompany(r.isCompany()).department(r.department())
                .city(r.city()).fullAddress(r.fullAddress()).addressReference(r.addressReference())
                .postalCode(r.postalCode()).photoUrl(r.photoUrl())
                .preferredCurrency(r.preferredCurrency()).build();
    }

    private UpdateProfileCommand toCommand(UpdateProfileRequest r) {
        return UpdateProfileCommand.builder()
                .firstName(r.firstName()).lastName(r.lastName()).phone(r.phone())
                .countryCode(r.countryCode()).location(r.location()).idNumber(r.idNumber())
                .birthDate(r.birthDate()).idType(r.idType()).companyName(r.companyName())
                .nit(r.nit()).isCompany(r.isCompany()).department(r.department())
                .city(r.city()).fullAddress(r.fullAddress()).addressReference(r.addressReference())
                .postalCode(r.postalCode()).photoUrl(r.photoUrl())
                .preferredCurrency(r.preferredCurrency()).build();
    }

    private UserResponse toResponse(UserResult result) {
        return UserResponse.from(result);
    }
}
