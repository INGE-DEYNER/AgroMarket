package com.agromarket.domain.services.shipping;

import com.agromarket.domain.models.enums.shipping.ShippingState;
import com.agromarket.domain.models.shipping.Shipping;

/**
 * Servicio de dominio que contiene las reglas de negocio relacionadas
 * con las transiciones y cancelaciones de los envíos.
 *
 * @author AgroMarket Team
 */
public class ShippingService {

    /**
     * Verifica si un envío puede avanzar al siguiente estado.
     *
     * <p>
     * La secuencia válida es:
     * ORDER_CONFIRMED → PREPARING → IN_TRANSIT →
     * IN_DELIVERY → DELIVERED.
     * </p>
     *
     * @param shipping envío a validar
     * @return true si el envío puede avanzar al siguiente estado
     */
    public boolean canAdvance(Shipping shipping) {
        if (shipping == null || shipping.getState() == null) {
            return false;
        }

        return switch (shipping.getState()) {
            case ORDER_CONFIRMED,
                    PREPARING,
                    IN_TRANSIT,
                    IN_DELIVERY ->
                true;

            case DELIVERED,
                    CANCELLED ->
                false;
        };
    }

    /**
     * Verifica si un envío puede ser cancelado.
     *
     * <p>
     * Solo puede cancelarse antes de entrar en transporte.
     * </p>
     *
     * @param shipping envío a validar
     * @return true si está en ORDER_CONFIRMED o PREPARING
     */
    public boolean canCancel(Shipping shipping) {
        if (shipping == null || shipping.getState() == null) {
            return false;
        }

        return shipping.getState() == ShippingState.ORDER_CONFIRMED
                || shipping.getState() == ShippingState.PREPARING;
    }

    /**
     * Mantiene compatibilidad con el nombre anterior del servicio.
     *
     * @param shipping envío a validar
     * @return true si puede avanzar
     */
    public boolean canAdvanceState(Shipping shipping) {
        return canAdvance(shipping);
    }

    /**
     * Verifica si una transición entre dos estados de envío es válida.
     *
     * @param currentState estado actual
     * @param nextState    estado siguiente solicitado
     * @return true si la transición es válida
     */
    public boolean isValidTransition(
            ShippingState currentState,
            ShippingState nextState) {

        if (currentState == null || nextState == null) {
            return false;
        }

        return switch (currentState) {
            case ORDER_CONFIRMED ->
                nextState == ShippingState.PREPARING;

            case PREPARING ->
                nextState == ShippingState.IN_TRANSIT;

            case IN_TRANSIT ->
                nextState == ShippingState.IN_DELIVERY;

            case IN_DELIVERY ->
                nextState == ShippingState.DELIVERED;

            case DELIVERED,
                    CANCELLED ->
                false;
        };
    }
}