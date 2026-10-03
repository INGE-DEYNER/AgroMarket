package com.agromarket.application.adapters.api.controllers.user;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.agromarket.application.adapters.persistence.sql.entities.user.AddressEntity;
import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.user.AddressJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.user.UserJpaRepository;
import com.agromarket.infrastructure.security.JwtUserPrincipal;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;

/**
 * Direcciones de envío persistidas por usuario.
 *
 * <p>
 * Contrato único: el endpoint canónico es {@code /api/v1/addresses} y se
 * conserva el alias {@code /api/v1/direcciones} que ya consumía el frontend.
 * El flag de dirección principal se acepta como {@code isDefault},
 * {@code main} o {@code principal} (alias documentados, mismo recurso).
 * </p>
 *
 * <p>
 * Toda operación valida que la dirección pertenezca al usuario del JWT
 * (sin acceso horizontal a direcciones de terceros).
 * </p>
 */
@RestController
@RequestMapping({ "/api/v1/addresses", "/api/v1/direcciones" })
@RequiredArgsConstructor
public class AddressController {

    private final AddressJpaRepository addresses;
    private final UserJpaRepository users;

    /** GET /api/v1/addresses — direcciones activas del usuario. */
    @GetMapping
    @Transactional(readOnly = true)
    public List<Map<String, Object>> list(
            @AuthenticationPrincipal JwtUserPrincipal principal) {

        return addresses.findByUser_IdAndActiveTrue(principal.getUserId())
                .stream()
                .map(this::view)
                .toList();
    }

    /** POST /api/v1/addresses — crea una dirección. */
    @PostMapping
    @Transactional
    public ResponseEntity<Map<String, Object>> create(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid @RequestBody AddressRequest request) {

        Long userId = principal.getUserId();
        UserEntity user = users.findById(userId)
                .orElseThrow(() -> new IllegalStateException(
                        "Usuario autenticado no existe: " + userId));

        List<AddressEntity> existing = addresses.findByUser_IdAndActiveTrue(userId);

        // La primera dirección es principal por definición.
        boolean makeDefault = request.isDefault() || existing.isEmpty();

        if (makeDefault) {
            clearDefault(userId, null);
        }

        AddressEntity address = new AddressEntity();
        address.setUser(user);
        address.setTitle(request.title().trim());
        address.setAddress(request.address().trim());
        address.setCity(request.city().trim());
        address.setPhone(request.phone().trim());
        address.setDefault(makeDefault);
        address.setActive(true);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(view(addresses.save(address)));
    }

    /** PUT /api/v1/addresses/{id} — actualiza una dirección propia. */
    @PutMapping("/{id}")
    @Transactional
    public Map<String, Object> update(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {

        Long userId = principal.getUserId();
        AddressEntity address = owned(userId, id);

        boolean makeDefault = request.isDefault();
        if (makeDefault) {
            clearDefault(userId, id);
        }

        address.setTitle(request.title().trim());
        address.setAddress(request.address().trim());
        address.setCity(request.city().trim());
        address.setPhone(request.phone().trim());
        address.setDefault(makeDefault);

        return view(addresses.save(address));
    }

    /** PATCH /api/v1/addresses/{id}/default — marca como principal. */
    @PatchMapping("/{id}/default")
    @Transactional
    public Map<String, Object> setDefault(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @PathVariable Long id) {

        Long userId = principal.getUserId();
        AddressEntity address = owned(userId, id);

        clearDefault(userId, id);
        address.setDefault(true);

        return view(addresses.save(address));
    }

    /**
     * DELETE /api/v1/addresses/{id} — borrado lógico e idempotente.
     *
     * <p>
     * Si se elimina la principal, se promueve otra dirección activa para que
     * el checkout siga teniendo una dirección por defecto.
     * </p>
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @PathVariable Long id) {

        Long userId = principal.getUserId();
        AddressEntity address = owned(userId, id);
        boolean wasDefault = address.isDefault();

        address.setActive(false);
        address.setDefault(false);
        addresses.save(address);

        if (wasDefault) {
            addresses.findFirstByUser_IdAndActiveTrueOrderByIdAsc(userId)
                    .ifPresent(next -> {
                        next.setDefault(true);
                        addresses.save(next);
                    });
        }

        return ResponseEntity.noContent().build();
    }

    // =====================================================================
    // HELPERS
    // =====================================================================

    private AddressEntity owned(Long userId, Long id) {
        return addresses.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "La dirección no pertenece al usuario autenticado"));
    }

    private void clearDefault(Long userId, Long exceptId) {
        addresses.findByUser_IdAndActiveTrue(userId).stream()
                .filter(address -> exceptId == null || !address.getId().equals(exceptId))
                .filter(AddressEntity::isDefault)
                .forEach(address -> {
                    address.setDefault(false);
                    addresses.save(address);
                });
    }

    /**
     * Vista de dirección: expone el flag como {@code isDefault} (canónico) y
     * como {@code main} (alias que ya consumía la UI).
     */
    private Map<String, Object> view(AddressEntity a) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", a.getId());
        response.put("title", a.getTitle());
        response.put("address", a.getAddress());
        response.put("city", a.getCity());
        response.put("phone", a.getPhone());
        response.put("isDefault", a.isDefault());
        response.put("main", a.isDefault());
        return response;
    }

    /** DTO único de entrada para crear/actualizar direcciones. */
    public record AddressRequest(
            @NotBlank @Size(max = 80) String title,
            @NotBlank @Size(max = 500) String address,
            @NotBlank @Size(max = 160) String city,
            @NotBlank @Size(max = 40) @jakarta.validation.constraints.Pattern(regexp = "[+0-9()\\-\\s]{7,40}", message = "El teléfono no es válido") String phone,
            @JsonAlias({ "main", "principal", "esPrincipal" }) boolean isDefault) {
    }
}
