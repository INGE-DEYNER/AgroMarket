package com.agromarket.domain.rfq.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.user.model.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad de dominio que representa una oferta para una solicitud de cotización.
 * Los productores crean ofertas en respuesta a las solicitudes de cotización de los compradores.
 * 
 * @author AgroMarket Team
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class QuoteOffer {
    
    private Long id;
    
    /**
     * Solicitud de cotización a la cual pertenece esta oferta.
     */
    private RequestForQuote requestForQuote;
    
    /**
     * Usuario que realizó la oferta (debe ser un productor).
     */
    private User producer;
    
    /**
     * Precio propuesto por el productor.
     */
    private BigDecimal proposedPrice;
    
    /**
     * Comentarios o condiciones adicionales de la oferta.
     */
    private String comments;
    
    /**
     * Indica si la oferta ha sido aceptada por el comprador.
     */
    @Builder.Default
    private boolean accepted = false;
    
    /**
     * Fecha y hora en que se creó la oferta.
     */
    private LocalDateTime createdAt;
}
