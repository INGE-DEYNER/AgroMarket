package com.agromarket.application.adapters.api.controllers.order;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.agromarket.application.adapters.persistence.sql.entities.order.ReturnItemEntity;
import com.agromarket.application.adapters.persistence.sql.entities.order.ReturnRequestEntity;
import com.agromarket.application.usecases.order.ReturnRequestUseCase;
import com.agromarket.domain.models.enums.order.ReturnStatus;
import com.agromarket.infrastructure.security.JwtUserPrincipal;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;

/**
 * Devoluciones y reembolsos.
 *
 * <p>
 * Endpoint canónico {@code /api/v1/returns} con alias
 * {@code /api/v1/devoluciones} (el que ya consumía el frontend).
 * </p>
 *
 * <ul>
 *   <li>El comprador crea, lista, consulta el detalle y cierra su caso.</li>
 *   <li>El administrador revisa, aprueba, rechaza (con motivo obligatorio) y
 *       ejecuta el reembolso real contra Mercado Pago.</li>
 *   <li>La propiedad del recurso se valida siempre contra el usuario del JWT:
 *       un comprador nunca puede ver ni operar solicitudes de otro.</li>
 * </ul>
 */
@RestController
@RequestMapping({ "/api/v1/returns", "/api/v1/devoluciones" })
@RequiredArgsConstructor
public class ReturnRequestController {

    private final ReturnRequestUseCase returnRequestUseCase;

    // =====================================================================
    // COMPRADOR
    // =====================================================================

    /** GET /api/v1/returns — solicitudes del comprador autenticado. */
    @GetMapping
    public List<Map<String, Object>> mine(
            @AuthenticationPrincipal JwtUserPrincipal principal) {

        return returnRequestUseCase.findMine(principal.getUserId())
                .stream()
                .map(this::summary)
                .toList();
    }

    /** GET /api/v1/returns/{id} — detalle (propio o admin). */
    @GetMapping("/{id}")
    public Map<String, Object> detail(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @PathVariable Long id) {

        ReturnRequestEntity request = returnRequestUseCase.findByIdForUser(
                id, principal.getUserId(), isAdmin(principal));

        return detail(request);
    }

    /**
     * POST /api/v1/returns — crea la solicitud de devolución.
     *
     * <p>
     * Idempotente vía cabecera {@code Idempotency-Key}; además el caso de uso
     * rechaza solicitudes activas duplicadas sobre el mismo pedido.
     * </p>
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyHeader,
            @Valid @RequestBody CreateReturnRequest request) {

        ReturnRequestEntity created = returnRequestUseCase.create(
                principal.getUserId(),
                request.orderId(),
                request.reason(),
                request.description(),
                request.evidences(),
                request.items(),
                idempotencyHeader != null && !idempotencyHeader.isBlank()
                        ? idempotencyHeader
                        : request.idempotencyKey());

        return ResponseEntity.status(HttpStatus.CREATED).body(detail(created));
    }

    /** PATCH /api/v1/returns/{id}/complete — el comprador cierra su caso. */
    @PatchMapping("/{id}/complete")
    public Map<String, Object> complete(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @PathVariable Long id) {

        return detail(returnRequestUseCase.complete(
                id, principal.getUserId(), isAdmin(principal)));
    }

    // =====================================================================
    // ADMINISTRACIÓN
    // =====================================================================

    /** GET /api/v1/returns/admin — listado completo (opcional por estado). */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> all(
            @RequestParam(required = false) String status) {

        List<ReturnRequestEntity> result = (status == null || status.isBlank())
                ? returnRequestUseCase.findAll()
                : returnRequestUseCase.findByStatus(parseStatus(status));

        return result.stream().map(this::summary).toList();
    }

    /** PATCH /api/v1/returns/{id}/review — pasa a UNDER_REVIEW. */
    @PatchMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> review(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body) {

        return detail(returnRequestUseCase.markUnderReview(id, comment(body)));
    }

    /** PATCH /api/v1/returns/{id}/approve — aprueba la devolución. */
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> approve(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body) {

        return detail(returnRequestUseCase.approve(id, comment(body)));
    }

    /** PATCH /api/v1/returns/{id}/reject — rechaza con motivo obligatorio. */
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> reject(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body) {

        return detail(returnRequestUseCase.reject(id, comment(body)));
    }

    /**
     * PATCH /api/v1/returns/{id}/refund — ejecuta el reembolso real.
     *
     * <p>
     * Idempotente: repetirlo sobre una solicitud ya reembolsada devuelve el
     * estado actual sin tocar de nuevo la pasarela.
     * </p>
     */
    @PatchMapping("/{id}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> refund(@PathVariable Long id) {
        return detail(returnRequestUseCase.refund(id));
    }

    // =====================================================================
    // HELPERS
    // =====================================================================

    private boolean isAdmin(JwtUserPrincipal principal) {

        if (principal == null || principal.getAuthorities() == null) {
            return false;
        }

        return principal.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    private String comment(Map<String, Object> body) {

        if (body == null) {
            return null;
        }

        Object value = body.containsKey("comment")
                ? body.get("comment")
                : body.get("motivo");

        return value == null ? null : String.valueOf(value);
    }

    private ReturnStatus parseStatus(String raw) {
        try {
            return ReturnStatus.valueOf(raw.trim().toUpperCase(java.util.Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Estado de devolución no válido: " + raw);
        }
    }

    /** Vista resumida para listados. */
    private Map<String, Object> summary(ReturnRequestEntity item) {

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", item.getId());
        response.put("orderId", item.getOrder() == null ? null : item.getOrder().getId());
        response.put("buyerId", item.getBuyer() == null ? null : item.getBuyer().getId());
        response.put("reason", item.getReason());
        response.put("description", item.getDescription());
        response.put("status", item.getStatus());
        response.put("adminComment", item.getAdminComment());
        response.put("refundAmount", item.getRefundAmount());
        response.put("createdAt", item.getCreatedAt());
        response.put("updatedAt", item.getUpdatedAt());
        response.put("refundedAt", item.getRefundedAt());
        response.put("completedAt", item.getCompletedAt());
        return response;
    }

    /** Vista de detalle con ítems, evidencias y monto reembolsable. */
    private Map<String, Object> detail(ReturnRequestEntity item) {

        Map<String, Object> response = new LinkedHashMap<>(summary(item));

        response.put("orderState",
                item.getOrder() == null || item.getOrder().getState() == null
                        ? null
                        : item.getOrder().getState().name());
        response.put("orderTotal",
                item.getOrder() == null ? null : item.getOrder().getTotal());
        response.put("paymentId",
                item.getPayment() == null ? null : item.getPayment().getId());
        response.put("paymentState",
                item.getPayment() == null || item.getPayment().getState() == null
                        ? null
                        : item.getPayment().getState().name());
        response.put("reviewedAt", item.getReviewedAt());
        response.put("gatewayRefundReference", item.getGatewayRefundReference());
        response.put("refundableAmount", returnRequestUseCase.refundableAmount(item));
        response.put("evidences", new ArrayList<>(item.getEvidences()));

        List<Map<String, Object>> items = new ArrayList<>();

        for (ReturnItemEntity detailItem : item.getItems()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", detailItem.getId());
            row.put("productId",
                    detailItem.getProduct() == null ? null : detailItem.getProduct().getId());
            row.put("productName",
                    detailItem.getProduct() == null ? null : detailItem.getProduct().getName());
            row.put("quantity", detailItem.getQuantity());
            row.put("unitPrice", detailItem.getUnitPrice());
            items.add(row);
        }

        response.put("items", items);
        response.put("refundableAmount", returnRequestUseCase.refundableAmount(item));

        return response;
    }

    /**
     * DTO de creación.
     *
     * <p>
     * {@code items} es un mapa opcional productoId -> cantidad; si se omite,
     * se devuelve el pedido completo.
     * </p>
     */
    public record CreateReturnRequest(
            @NotNull Long orderId,
            @NotBlank @Size(max = 60) String reason,
            @Size(max = 2000) String description,
            @Size(max = 20) List<String> evidences,
            Map<Long, Integer> items,
            @Size(max = 120) String idempotencyKey) {
    }
}

