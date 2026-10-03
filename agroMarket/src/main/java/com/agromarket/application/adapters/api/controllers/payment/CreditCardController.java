package com.agromarket.application.adapters.api.controllers.payment;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.agromarket.application.adapters.persistence.sql.entities.payment.CreditCardEntity;
import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.payment.CreditCardJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.user.UserJpaRepository;
import com.agromarket.domain.models.enums.payment.CardStatus;
import com.agromarket.domain.models.enums.payment.CardType;
import com.agromarket.infrastructure.security.JwtUserPrincipal;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

/**
 * Tarjetas y métodos de pago tokenizados del usuario autenticado.
 *
 * <p>
 * Reglas de seguridad implementadas aquí:
 * </p>
 *
 * <ul>
 *   <li>Nunca se recibe ni almacena el PAN ni el CVV: solo el token que emite
 *       la pasarela (Mercado Pago) junto con marca, últimos 4 dígitos y la
 *       expiración informativa.</li>
 *   <li>Toda operación valida que la tarjeta pertenezca al usuario del JWT
 *       (no hay acceso horizontal a tarjetas de terceros).</li>
 *   <li>El alta es idempotente por (usuario, token): repetir la petición
 *       devuelve la tarjeta ya existente en lugar de duplicarla.</li>
 * </ul>
 */
@RestController
@RequestMapping({ "/api/v1/cards", "/api/v1/tarjetas" })
@RequiredArgsConstructor
public class CreditCardController {

    /**
     * Detecta intentos de enviar un PAN (12+ dígitos consecutivos) en el
     * token. Barrera defensiva: un token real de Mercado Pago nunca contiene
     * una secuencia tan larga de dígitos.
     */
    private static final Pattern PAN_LIKE = Pattern.compile(".*\\d{12,}.*");

    private final CreditCardJpaRepository cards;
    private final UserJpaRepository users;

    /** GET /api/v1/cards — lista las tarjetas activas del usuario. */
    @GetMapping
    @Transactional(readOnly = true)
    public List<Map<String, Object>> list(
            @AuthenticationPrincipal JwtUserPrincipal principal) {

        return cards.findByUser_IdAndActiveTrue(principal.getUserId())
                .stream()
                .map(this::view)
                .toList();
    }

    /**
     * POST /api/v1/cards — registra una tarjeta tokenizada.
     *
     * <p>
     * Idempotente: si el usuario ya registró el mismo token, devuelve 200 con
     * la tarjeta existente (actualizando los campos no sensibles), en lugar
     * de crear un duplicado.
     * </p>
     */
    @PostMapping
    @Transactional
    public ResponseEntity<Map<String, Object>> create(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid @RequestBody CreateCardRequest request) {

        rejectPanLike(request.gatewayToken());

        Long userId = principal.getUserId();
        UserEntity user = users.findById(userId)
                .orElseThrow(() -> new IllegalStateException(
                        "Usuario autenticado no existe: " + userId));

        var existing = cards.findByUser_IdAndGatewayToken(userId, request.gatewayToken());

        if (existing.isPresent()) {
            CreditCardEntity card = existing.get();
            applyNonSensitiveFields(card, request);

            if (request.isDefault()) {
                clearDefault(userId, card.getId());
                card.setDefault(true);
            }

            card.setActive(true);
            card.setStatus(CardStatus.ACTIVE);

            return ResponseEntity.ok(view(cards.save(card)));
        }

        if (request.isDefault()) {
            clearDefault(userId, null);
        }

        CreditCardEntity card = new CreditCardEntity();
        card.setUser(user);
        card.setLastFourDigits(request.lastFourDigits());
        card.setGatewayToken(request.gatewayToken());
        card.setDefault(request.isDefault());
        card.setActive(true);
        card.setStatus(CardStatus.ACTIVE);
        applyNonSensitiveFields(card, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(view(cards.save(card)));
    }

    /**
     * PATCH /api/v1/cards/{id}/default — marca la tarjeta como principal.
     */
    @PatchMapping("/{id}/default")
    @Transactional
    public Map<String, Object> setDefault(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @PathVariable Long id) {

        CreditCardEntity card = owned(principal.getUserId(), id);

        if (card.getStatus() == CardStatus.INVALID) {
            throw new IllegalStateException(
                    "La tarjeta no es válida; vuelve a tokenizarla");
        }

        clearDefault(principal.getUserId(), id);
        card.setDefault(true);
        card.setActive(true);

        return view(cards.save(card));
    }

    /**
     * DELETE /api/v1/cards/{id} — eliminación lógica e idempotente.
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @PathVariable Long id) {

        Long userId = principal.getUserId();
        CreditCardEntity card = owned(userId, id);
        boolean wasDefault = card.isDefault();

        card.setActive(false);
        card.setDefault(false);
        card.setStatus(CardStatus.INACTIVE);
        cards.save(card);

        if (wasDefault) {
            List<CreditCardEntity> remaining = cards.findByUser_IdAndActiveTrue(userId);
            if (!remaining.isEmpty()) {
                CreditCardEntity promoted = remaining.get(0);
                promoted.setDefault(true);
                cards.save(promoted);
            }
        }

        return ResponseEntity.noContent().build();
    }

    // =====================================================================
    // HELPERS
    // =====================================================================

    private CreditCardEntity owned(Long userId, Long cardId) {
        return cards.findByIdAndUser_Id(cardId, userId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "La tarjeta no pertenece al usuario autenticado"));
    }

    private void clearDefault(Long userId, Long exceptCardId) {
        cards.findByUser_IdAndActiveTrue(userId).stream()
                .filter(card -> exceptCardId == null || !card.getId().equals(exceptCardId))
                .filter(CreditCardEntity::isDefault)
                .forEach(card -> {
                    card.setDefault(false);
                    cards.save(card);
                });
    }

    private void applyNonSensitiveFields(
            CreditCardEntity card, CreateCardRequest request) {

        card.setCardType(request.cardType());
        card.setLastFourDigits(request.lastFourDigits());
        card.setProvider(normalizeProvider(request.provider()));
        card.setExpirationMonth(request.expirationMonth());
        card.setExpirationYear(request.expirationYear());
    }

    private String normalizeProvider(String provider) {
        return provider == null || provider.isBlank()
                ? "MERCADO_PAGO"
                : provider.trim().toUpperCase(java.util.Locale.ROOT);
    }

    private void rejectPanLike(String gatewayToken) {
        if (gatewayToken != null && PAN_LIKE.matcher(gatewayToken).matches()) {
            throw new IllegalArgumentException(
                    "No se aceptan números completos de tarjeta (PAN): usa el token de la pasarela");
        }
    }

    private Map<String, Object> view(CreditCardEntity card) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", card.getId());
        response.put("cardType", card.getCardType());
        response.put("lastFourDigits", card.getLastFourDigits());
        response.put("provider", card.getProvider());
        response.put("expirationMonth", card.getExpirationMonth());
        response.put("expirationYear", card.getExpirationYear());
        response.put("status",
                card.getStatus() == null ? CardStatus.ACTIVE : card.getStatus());
        response.put("isDefault", card.isDefault());
        response.put("profile", profile(card));
        return response;
    }

    /** Texto de presentación (nunca incluye datos sensibles). */
    private String profile(CreditCardEntity card) {
        String brand = card.getCardType() == null ? "TARJETA" : card.getCardType().name();
        return brand + " •••• " + card.getLastFourDigits();
    }

    /**
     * DTO de alta. Acepta el contrato canónico en inglés y los alias en
     * español que envía el frontend, sin duplicar endpoints.
     */
    public record CreateCardRequest(
            @JsonAlias({ "marca", "brand" }) CardType cardType,
            @NotBlank @jakarta.validation.constraints.Pattern(regexp = "\\d{4}", message = "lastFourDigits debe tener 4 dígitos") @JsonAlias({ "ultimosDigitos", "last4" }) String lastFourDigits,
            @NotBlank @JsonAlias({ "token", "tokenTarjeta" }) String gatewayToken,
            @JsonAlias({ "principal" }) boolean isDefault,
            @JsonAlias({ "proveedor" }) String provider,
            @JsonAlias({ "mesExpiracion" }) Integer expirationMonth,
            @JsonAlias({ "anioExpiracion" }) Integer expirationYear) {
    }
}
