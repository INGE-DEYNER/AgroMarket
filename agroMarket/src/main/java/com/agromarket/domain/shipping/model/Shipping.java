package com.agromarket.domain.shipping.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.agromarket.domain.shipping.enums.ShippingState;
import com.agromarket.domain.order.model.Order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad de dominio que representa un envío en el sistema AgroMarket.
 * Contiene información sobre la dirección de destino, estado y detalles logísticos.
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
     * Transiciones válidas:
     * - PREPARING → IN_TRANSIT
     * - IN_TRANSIT → IN_DELIVERY → DELIVERED
     */
    public void advanceState() {
        if (state == ShippingState.PREPARING) {
            state = ShippingState.IN_TRANSIT;
            return;
        }
        if (state == ShippingState.IN_TRANSIT) {
            state = ShippingState.IN_DELIVERY;
        }
    }
}
