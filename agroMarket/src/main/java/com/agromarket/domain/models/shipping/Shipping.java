package com.agromarket.domain.models.shipping;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.agromarket.domain.exceptions.shipping.InvalidShippingStateException;
import com.agromarket.domain.models.enums.shipping.ShippingState;
import com.agromarket.domain.models.order.Order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad de dominio que representa un envío en el sistema AgroMarket.
 * Contiene información sobre la dirección de destino, estado y detalles
 * logísticos.
 *
 * @author AgroMarket Team
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Shipping {

    private Long id;

    /**
     * Pedido asociado a este envío.
     */
    private Order order;

    /**
     * Dirección de destino del envío.
     */
    private String destinationAddress;

    /**
     * Estado actual del envío.
     */
    private ShippingState state;

    /**
     * Nombre de la transportadora o servicio de envío.
     */
    private String carrier;

    /**
     * Número de guía o rastreo del envío.
     */
    private String trackingNumber;

    /**
     * Fecha estimada de entrega.
     */
    private LocalDate estimatedDeliveryDate;

    /**
     * Origen del envío (por defecto: Chigorodó, Antioquia).
     */
    @Builder.Default
    private String origin = "Chigorodó, Antioquia";

    /**
     * Fecha y hora en que se creó el registro de envío.
     */
    private LocalDateTime createdAt;

    // ==================== MÉTODOS DE NEGOCIO ====================

    /**
     * Avanza el estado del envío según su estado actual.
     *
     * Transiciones válidas:
     * ORDER_CONFIRMED → PREPARING
     * PREPARING → IN_TRANSIT
     * IN_TRANSIT → IN_DELIVERY
     * IN_DELIVERY → DELIVERED
     *
     * @throws InvalidShippingStateException si el estado actual no permite
     *                                       avanzar
     */
    public void advanceState() {
        if (state == null) {
            throw new InvalidShippingStateException(
                    "No se puede avanzar un envío sin estado");
        }

        switch (state) {
            case ORDER_CONFIRMED:
                state = ShippingState.PREPARING;
                return;

            case PREPARING:
                state = ShippingState.IN_TRANSIT;
                return;

            case IN_TRANSIT:
                state = ShippingState.IN_DELIVERY;
                return;

            case IN_DELIVERY:
                state = ShippingState.DELIVERED;
                return;

            case DELIVERED:
                throw new InvalidShippingStateException(
                        "No se puede avanzar un envío que ya fue entregado");

            case CANCELLED:
                throw new InvalidShippingStateException(
                        "No se puede avanzar un envío cancelado");

            default:
                throw new InvalidShippingStateException(
                        "Estado de envío no contemplado: " + state);
        }
    }

    /**
     * Cancela el envío.
     *
     * <p>
     * La cancelación únicamente está permitida mientras el envío
     * permanece en ORDER_CONFIRMED o PREPARING, es decir, antes de
     * entrar en transporte.
     * </p>
     *
     * @throws InvalidShippingStateException si el envío ya inició
     *                                       transporte, fue entregado, cancelado o
     *                                       no tiene un estado válido
     */
    public void cancel() {
        if (state == ShippingState.ORDER_CONFIRMED
                || state == ShippingState.PREPARING) {

            state = ShippingState.CANCELLED;
            return;
        }

        throw new InvalidShippingStateException(
                "No se puede cancelar un envío en estado: " + state);
    }
}