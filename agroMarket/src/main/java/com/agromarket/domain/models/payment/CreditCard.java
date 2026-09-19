package com.agromarket.domain.models.payment;

import com.agromarket.domain.models.enums.payment.CardType;
import com.agromarket.domain.models.user.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad de dominio que representa una tarjeta de pago registrada por un usuario.
 * Almacena información segura de la tarjeta para facilitar pagos recurrentes.
 * 
 * @author AgroMarket Team
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CreditCard {
    
    private Long id;
    
    /**
     * Usuario propietario de la tarjeta.
     */
    private User user;
    
    /**
     * Tipo de tarjeta (VISA, MASTERCARD, etc.).
     */
    private CardType cardType;
    
    /**
     * Últimos cuatro dígitos de la tarjeta (para identificación segura).
     */
    private String lastFourDigits;
    
    /**
     * Token de la pasarela de pago que representa la tarjeta.
     * Este token permite procesar pagos sin almacenar los datos sensibles de la tarjeta.
     */
    private String gatewayToken;
    
    /**
     * Indica si esta es la tarjeta predeterminada del usuario.
     */
    @Builder.Default
    private boolean isDefault = false;
    
    /**
     * Indica si la tarjeta está activa y puede ser usada para pagos.
     */
    @Builder.Default
    private boolean active = true;
}
