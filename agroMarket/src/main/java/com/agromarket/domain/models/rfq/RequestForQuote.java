package com.agromarket.domain.rfq.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.agromarket.domain.product.enums.FruitType;
import com.agromarket.domain.user.model.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad de dominio que representa una solicitud de cotización (Request for Quote).
 * Permite a los compradores solicitar cotizaciones personalizadas a los productores
 * para grandes cantidades o condiciones especiales.
 * 
 * @author AgroMarket Team
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class RequestForQuote {
    
    private Long id;
    
    /**
     * Usuario que creó la solicitud de cotización (debe ser un comprador).
     */
    private User buyer;
    
    /**
     * Tipo de fruta solicitada.
     */
    private FruitType fruitType;
    
    /**
     * Cantidad requerida en kilogramos o unidades.
     */
    private Double requiredQuantity;
    
    /**
     * Descripción adicional de los requisitos.
     */
    private String description;
    
    /**
     * Fecha límite para que los productores presenten sus ofertas.
     */
    private LocalDateTime deadline;
    
    /**
     * Indica si la solicitud de cotización está activa.
     */
    @Builder.Default
    private boolean active = true;
    
    /**
     * Fecha y hora en que se creó la solicitud.
     */
    private LocalDateTime createdAt;
    
    /**
     * Lista de ofertas recibidas para esta solicitud de cotización.
     */
    @Builder.Default
    private List<QuoteOffer> offers = new ArrayList<>();
}
