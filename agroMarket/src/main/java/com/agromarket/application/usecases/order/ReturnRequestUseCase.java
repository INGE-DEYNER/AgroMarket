package com.agromarket.application.usecases.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.application.adapters.persistence.sql.entities.order.OrderEntity;
import com.agromarket.application.adapters.persistence.sql.entities.order.OrderItemEntity;
import com.agromarket.application.adapters.persistence.sql.entities.order.ReturnItemEntity;
import com.agromarket.application.adapters.persistence.sql.entities.order.ReturnRequestEntity;
import com.agromarket.application.adapters.persistence.sql.entities.payment.PaymentEntity;
import com.agromarket.application.adapters.persistence.sql.entities.product.ProductEntity;
import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.order.OrderJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.order.ReturnRequestJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.payment.PaymentJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.user.UserJpaRepository;
import com.agromarket.domain.exceptions.order.InvalidOrderStateException;
import com.agromarket.domain.exceptions.order.OrderNotFoundException;
import com.agromarket.domain.models.enums.order.ReturnStatus;
import com.agromarket.domain.models.enums.payment.PaymentState;
import com.agromarket.domain.services.order.ReturnRequestService;

import lombok.RequiredArgsConstructor;

/**
 * Caso de uso de devoluciones y reembolsos.
 *
 * <p>
 * Concentra la lógica de negocio del ciclo
 * REQUESTED → UNDER_REVIEW → APPROVED → REFUNDED → COMPLETED y del rechazo
 * con motivo, reutilizando el puerto de pagos existente
 * ({@code PaymentPort#refundPayment}) para que el reembolso se ejecute contra
 * la pasarela real (Mercado Pago) y sea idempotente.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class ReturnRequestUseCase {

    private static final Logger logger = LoggerFactory.getLogger(ReturnRequestUseCase.class);

    /** Estados del pago desde los que se puede reembolsar. */
    private static final Set<PaymentState> REFUNDABLE_PAYMENT_STATES = Set.of(
            PaymentState.CONFIRMED,
            PaymentState.IN_ESCROW,
            PaymentState.REVERSED);

    private final ReturnRequestJpaRepository returns;
    private final OrderJpaRepository orders;
    private final UserJpaRepository users;
    private final PaymentJpaRepository payments;
    private final ReturnRequestService returnRequestService;
    private final com.agromarket.domain.ports.in.payment.PaymentPort paymentPort;

    // =====================================================================
    // CONSULTAS
    // =====================================================================

    @Transactional(readOnly = true)
    public List<ReturnRequestEntity> findMine(Long buyerId) {
        return returns.findByBuyer_IdOrderByCreatedAtDesc(buyerId);
    }

    @Transactional(readOnly = true)
    public List<ReturnRequestEntity> findAll() {
        return returns.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<ReturnRequestEntity> findByStatus(ReturnStatus status) {
        return returns.findByStatusOrderByCreatedAtDesc(status);
    }

    /**
     * Obtiene una solicitud validando propiedad: el comprador solo puede ver
     * las suyas; el administrador ve todas.
     */
    @Transactional(readOnly = true)
    public ReturnRequestEntity findByIdForUser(Long id, Long requesterId, boolean admin) {

        ReturnRequestEntity request = findOrThrow(id);

        if (!admin && !request.getBuyer().getId().equals(requesterId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "La solicitud no pertenece al usuario autenticado");
        }

        return request;
    }

    // =====================================================================
    // CREACIÓN
    // =====================================================================

    /**
     * Crea una solicitud de devolución. Idempotente por
     * {@code idempotencyKey} y bloquea duplicados activos del mismo pedido.
     */
    @Transactional
    public ReturnRequestEntity create(
            Long buyerId,
            Long orderId,
            String reason,
            String description,
            List<String> evidences,
            Map<Long, Integer> itemsByProduct,
            String idempotencyKey) {

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            Optional<ReturnRequestEntity> previous = returns.findByIdempotencyKey(idempotencyKey);
            if (previous.isPresent()) {
                logger.info("Solicitud de devolución idempotente reutilizada: {}",
                        idempotencyKey);
                return previous.get();
            }
        }

        OrderEntity order = orders.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(
                        "Pedido no encontrado: " + orderId));

        UserEntity buyer = users.findById(buyerId)
                .orElseThrow(() -> new IllegalStateException(
                        "Usuario autenticado no existe: " + buyerId));

        if (order.getBuyer() == null || !order.getBuyer().getId().equals(buyerId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "El pedido no pertenece al usuario autenticado");
        }

        returnRequestService.validateEligibility(order.getState());

        // Evita solicitudes duplicadas mientras una siga activa.
        returns.findFirstByOrder_IdAndStatusInOrderByCreatedAtDesc(
                orderId,
                List.of(
                        ReturnStatus.REQUESTED,
                        ReturnStatus.UNDER_REVIEW,
                        ReturnStatus.APPROVED,
                        ReturnStatus.REFUNDED))
                .ifPresent(active -> {
                    throw new InvalidOrderStateException(
                            "Ya existe una solicitud activa para este pedido (#"
                                    + active.getId()
                                    + ", estado " + active.getStatus() + ")");
                });

        ReturnRequestEntity entity = new ReturnRequestEntity();
        entity.setOrder(order);
        entity.setBuyer(buyer);
        entity.setReason(reason.trim().toUpperCase(java.util.Locale.ROOT));
        entity.setDescription(description);
        entity.setStatus(ReturnStatus.REQUESTED);
        entity.setIdempotencyKey(
                idempotencyKey == null || idempotencyKey.isBlank()
                        ? null
                        : idempotencyKey.trim());

        if (evidences != null) {
            Set<String> clean = new LinkedHashSet<>();
            evidences.stream()
                    .filter(url -> url != null && !url.isBlank())
                    .map(String::trim)
                    .limit(20)
                    .forEach(clean::add);
            entity.setEvidences(clean);
        }

        attachItems(entity, order, itemsByProduct);
        attachPayment(entity, order);

        return returns.save(entity);
    }

    /**
     * Adjunta los ítems devueltos. Si el cliente no especifica ninguno, se
     * asume el pedido completo (escenario más común).
     */
    private void attachItems(
            ReturnRequestEntity entity,
            OrderEntity order,
            Map<Long, Integer> itemsByProduct) {

        List<OrderItemEntity> orderItems = order.getItems() == null
                ? List.of()
                : order.getItems();

        List<ReturnItemEntity> result = new ArrayList<>();

        for (OrderItemEntity orderItem : orderItems) {

            ProductEntity product = orderItem.getProduct();

            if (product == null || product.getId() == null) {
                continue;
            }

            int requested = orderItem.getQuantity() == null
                    ? 0
                    : orderItem.getQuantity();

            if (itemsByProduct != null && itemsByProduct.containsKey(product.getId())) {
                Integer fromClient = itemsByProduct.get(product.getId());
                if (fromClient == null || fromClient <= 0) {
                    continue;
                }
                requested = Math.min(fromClient, requested);
            }

            if (requested <= 0) {
                continue;
            }

            ReturnItemEntity item = new ReturnItemEntity();
            item.setReturnRequest(entity);
            item.setProduct(product);
            item.setQuantity(requested);
            item.setUnitPrice(orderItem.getUnitPrice());
            result.add(item);
        }

        entity.setItems(result);
    }

    /** Vincula el pago confirmado/en fideicomiso del pedido, si existe. */
    private void attachPayment(ReturnRequestEntity entity, OrderEntity order) {

        List<PaymentEntity> candidates = payments.findByOrder_Id(order.getId());

        PaymentEntity best = null;

        for (PaymentEntity payment : candidates) {
            if (payment.getState() == PaymentState.CONFIRMED
                    || payment.getState() == PaymentState.IN_ESCROW) {
                if (best == null || (payment.getId() != null
                        && best.getId() != null
                        && payment.getId() > best.getId())) {
                    best = payment;
                }
            }
        }

        entity.setPayment(best);
    }

    // =====================================================================
    // TRANSICIONES
    // =====================================================================

    @Transactional
    public ReturnRequestEntity markUnderReview(Long id, String comment) {

        ReturnRequestEntity request = findOrThrow(id);

        returnRequestService.validateTransition(
                request.getStatus(), ReturnStatus.UNDER_REVIEW);

        if (request.getStatus() == ReturnStatus.UNDER_REVIEW) {
            return request;
        }

        request.setStatus(ReturnStatus.UNDER_REVIEW);
        request.setReviewedAt(LocalDateTime.now());

        if (comment != null && !comment.isBlank()) {
            request.setAdminComment(comment.trim());
        }

        return returns.save(request);
    }

    @Transactional
    public ReturnRequestEntity approve(Long id, String comment) {

        ReturnRequestEntity request = findOrThrow(id);

        returnRequestService.validateTransition(
                request.getStatus(), ReturnStatus.APPROVED);

        if (request.getStatus() == ReturnStatus.APPROVED) {
            return request;
        }

        request.setStatus(ReturnStatus.APPROVED);
        request.setReviewedAt(LocalDateTime.now());

        if (comment != null && !comment.isBlank()) {
            request.setAdminComment(comment.trim());
        }

        return returns.save(request);
    }

    @Transactional
    public ReturnRequestEntity reject(Long id, String comment) {

        if (comment == null || comment.isBlank()) {
            throw new IllegalArgumentException(
                    "El motivo del rechazo es obligatorio");
        }

        ReturnRequestEntity request = findOrThrow(id);

        returnRequestService.validateTransition(
                request.getStatus(), ReturnStatus.REJECTED);

        request.setStatus(ReturnStatus.REJECTED);
        request.setAdminComment(comment.trim());
        request.setReviewedAt(LocalDateTime.now());

        return returns.save(request);
    }

    /**
     * Ejecuta el reembolso real contra la pasarela.
     *
     * <p>
     * Idempotente: si la solicitud ya está REFUNDED o COMPLETED devuelve el
     * estado actual sin volver a llamar a la pasarela. En producción, un
     * fallo de Mercado Pago revienta la transacción: nunca se marca REFUNDED
     * sin dinero real devuelto.
     * </p>
     */
    @Transactional
    public ReturnRequestEntity refund(Long id) {

        ReturnRequestEntity request = findOrThrow(id);

        if (request.getStatus() == ReturnStatus.REFUNDED
                || request.getStatus() == ReturnStatus.COMPLETED) {
            logger.info("Reembolso idempotente: la solicitud {} ya está en {}",
                    id, request.getStatus());
            return request;
        }

        if (request.getStatus() != ReturnStatus.APPROVED) {
            throw new InvalidOrderStateException(
                    "Solo puede reembolsarse una solicitud aprobada. Estado actual: "
                            + request.getStatus());
        }

        PaymentEntity payment = request.getPayment();

        if (payment == null) {
            throw new InvalidOrderStateException(
                    "La solicitud no tiene un pago asociado; no se puede reembolsar");
        }

        if (payment.getState() == PaymentState.REFUNDED) {
            // El pago ya se reembolsó: reflejarlo sin tocar la pasarela otra vez.
            request.setStatus(ReturnStatus.REFUNDED);
            request.setRefundAmount(payment.getAmount());
            request.setRefundedAt(LocalDateTime.now());
            request.setGatewayRefundReference(payment.getGatewayReference());
            return returns.save(request);
        }

        if (!REFUNDABLE_PAYMENT_STATES.contains(payment.getState())) {
            throw new InvalidOrderStateException(
                    "El pago no puede reembolsarse desde el estado "
                            + payment.getState());
        }

        if (payment.getGatewayReference() == null
                || payment.getGatewayReference().isBlank()) {
            throw new InvalidOrderStateException(
                    "El pago no tiene referencia de pasarela; no se puede reembolsar");
        }

        // Reembolso REAL vía el puerto de pagos existente.
        var paymentResult = paymentPort.refundPayment(payment.getId());

        request.setStatus(ReturnStatus.REFUNDED);
        request.setRefundAmount(paymentResult.getAmount() == null
                ? payment.getAmount()
                : paymentResult.getAmount());
        request.setRefundedAt(LocalDateTime.now());
        request.setGatewayRefundReference(paymentResult.getGatewayReference());

        return returns.save(request);
    }

    /**
     * Cierra el caso: lo puede cerrar el administrador o el propio comprador
     * confirmando que recibió el dinero.
     */
    @Transactional
    public ReturnRequestEntity complete(Long id, Long requesterId, boolean admin) {

        ReturnRequestEntity request = findByIdForUser(id, requesterId, admin);

        returnRequestService.validateTransition(
                request.getStatus(), ReturnStatus.COMPLETED);

        if (request.getStatus() == ReturnStatus.COMPLETED) {
            return request;
        }

        request.setStatus(ReturnStatus.COMPLETED);
        request.setCompletedAt(LocalDateTime.now());

        return returns.save(request);
    }

    // =====================================================================
    // HELPERS
    // =====================================================================

    private ReturnRequestEntity findOrThrow(Long id) {
        return returns.findByIdWithDetails(id)
                .orElseThrow(() -> new OrderNotFoundException(
                        "Solicitud de devolución no encontrada: " + id));
    }

    /** Monto máximo reembolsable, útil para la UI administrativa. */
    public BigDecimal refundableAmount(ReturnRequestEntity request) {

        if (request.getPayment() != null && request.getPayment().getAmount() != null) {
            return request.getPayment().getAmount();
        }

        return request.getOrder() == null ? BigDecimal.ZERO : request.getOrder().getTotal();
    }
}