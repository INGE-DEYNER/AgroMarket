package com.agromarket.domain.services.order;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

import com.agromarket.domain.exceptions.order.InvalidOrderStateException;
import com.agromarket.domain.models.enums.order.OrderState;
import com.agromarket.domain.models.enums.order.ReturnStatus;

/**
 * Reglas de negocio de las devoluciones y reembolsos.
 *
 * <p>
 * Vive en el dominio (no en el controlador) para que la elegibilidad y las
 * transiciones de estado se validen una única vez, sin importar quién las
 * invoque.
 * </p>
 *
 * @author AgroMarket Team
 */
public class ReturnRequestService {

    /**
     * Estados del pedido que habilitan una devolución: solo pedidos
     * efectivamente entregados o ya despachados.
     */
    private static final Set<OrderState> ELIGIBLE_ORDER_STATES = EnumSet.of(
            OrderState.DELIVERED);

    /** Estados terminales: no admiten más transiciones. */
    private static final Set<ReturnStatus> TERMINAL_STATES = EnumSet.of(
            ReturnStatus.REJECTED,
            ReturnStatus.COMPLETED);

    /**
     * Transiciones válidas del flujo de devolución.
     */
    private static final Map<ReturnStatus, Set<ReturnStatus>> TRANSITIONS = Map.of(
            ReturnStatus.REQUESTED, EnumSet.of(
                    ReturnStatus.UNDER_REVIEW,
                    ReturnStatus.APPROVED,
                    ReturnStatus.REJECTED),
            ReturnStatus.UNDER_REVIEW, EnumSet.of(
                    ReturnStatus.APPROVED,
                    ReturnStatus.REJECTED),
            ReturnStatus.APPROVED, EnumSet.of(
                    ReturnStatus.REFUNDED),
            ReturnStatus.REFUNDED, EnumSet.of(
                    ReturnStatus.COMPLETED));

    /**
     * Valida que el pedido pueda devolverse.
     *
     * @param orderState estado actual del pedido
     * @throws InvalidOrderStateException si el pedido no es elegible
     */
    public void validateEligibility(OrderState orderState) {

        if (orderState == null) {
            throw new InvalidOrderStateException(
                    "El pedido no tiene estado; no puede devolverse");
        }

        if (!ELIGIBLE_ORDER_STATES.contains(orderState)) {
            throw new InvalidOrderStateException(
                    "Solo pueden devolverse pedidos entregados. Estado actual: "
                            + orderState);
        }
    }

    /**
     * Valida una transición de estado de la solicitud.
     *
     * @param current estado actual
     * @param target  estado deseado
     * @throws InvalidOrderStateException si la transición no está permitida
     */
    public void validateTransition(ReturnStatus current, ReturnStatus target) {

        if (current == null) {
            throw new InvalidOrderStateException(
                    "La solicitud no tiene estado");
        }

        if (target == null) {
            throw new InvalidOrderStateException(
                    "El estado destino es obligatorio");
        }

        if (current == target) {
            // Idempotencia: repetir la misma operación es válido.
            return;
        }

        if (TERMINAL_STATES.contains(current)) {
            throw new InvalidOrderStateException(
                    "La solicitud está en un estado final (" + current
                            + ") y no admite cambios");
        }

        Set<ReturnStatus> allowed = TRANSITIONS.getOrDefault(current, Set.of());

        if (!allowed.contains(target)) {
            throw new InvalidOrderStateException(
                    "Transición no permitida: " + current + " -> " + target);
        }
    }

    /**
     * Indica si la solicitud ya alcanzó el estado solicitado (para que las
     * operaciones repetidas sean idempotentes).
     */
    public boolean isAlreadyIn(ReturnStatus current, ReturnStatus expected) {
        return current == expected;
    }

    /**
     * Indica si la solicitud está activa (bloquea nuevas solicitudes del
     * mismo pedido, evitando duplicados).
     */
    public boolean isActive(ReturnStatus status) {

        return status != null
                && status != ReturnStatus.REJECTED
                && status != ReturnStatus.COMPLETED;
    }
}